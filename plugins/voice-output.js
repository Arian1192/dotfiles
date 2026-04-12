import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawn } from "node:child_process"

const DEFAULT_CONFIG_PATH = "plugins/voice-output.config.json"
const DEFAULT_DISABLED_CONFIG = {
  enabled: false,
  provider: "mock",
  playback: {
    mode: "none",
    command: ["afplay", "$AUDIO_PATH"],
  },
  profilePath: null,
  filters: {
    minLength: 12,
    maxLength: 4000,
    skipCodeBlocks: true,
    blockedMarkers: [
      "## Shared Contract",
      "## Coordination Message",
      "## Coordination Trace",
      "validation-failure",
      "tool_use",
    ],
  },
  voxcpmBridge: {
    mode: "cli",
    command: ["python3", "./plugins/voxcpm_bridge.py"],
    timeoutMs: 30000,
  },
}

let activePlayback = null
let activeGeneration = 0

function expandHome(value) {
  if (!value || typeof value !== "string") return value
  if (!value.startsWith("~/")) return value
  return path.join(os.homedir(), value.slice(2))
}

function resolvePath(baseDir, value) {
  if (!value || typeof value !== "string") return null
  const expanded = expandHome(value)
  if (path.isAbsolute(expanded)) return expanded
  return path.resolve(baseDir, expanded)
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8")
  return JSON.parse(raw)
}

async function log(client, level, message, extra = {}) {
  await client.app.log({
    body: {
      service: "voice-output-plugin",
      level,
      message,
      extra,
    },
  })
}

async function loadConfig(directory) {
  const envPath = process.env.OPENCODE_VOICE_OUTPUT_CONFIG
  const configPath = resolvePath(directory, envPath || DEFAULT_CONFIG_PATH)
  if (!(await exists(configPath))) {
    return {
      configPath,
      config: DEFAULT_DISABLED_CONFIG,
      source: "default-disabled",
    }
  }

  const raw = await readJson(configPath)
  return {
    configPath,
    source: envPath ? "env" : "file",
    config: {
      ...DEFAULT_DISABLED_CONFIG,
      ...raw,
      playback: {
        ...DEFAULT_DISABLED_CONFIG.playback,
        ...(raw.playback || {}),
      },
      filters: {
        ...DEFAULT_DISABLED_CONFIG.filters,
        ...(raw.filters || {}),
      },
      voxcpmBridge: {
        ...DEFAULT_DISABLED_CONFIG.voxcpmBridge,
        ...(raw.voxcpmBridge || {}),
      },
    },
  }
}

function isEligibleText(text, filters) {
  const value = String(text || "").trim()
  if (!value) return { ok: false, reason: "empty" }
  if (value.length < filters.minLength) return { ok: false, reason: "too-short" }
  if (value.length > filters.maxLength) return { ok: false, reason: "too-long" }
  if (filters.skipCodeBlocks && value.includes("```") ) return { ok: false, reason: "contains-code-block" }

  for (const marker of filters.blockedMarkers || []) {
    if (value.includes(marker)) return { ok: false, reason: `blocked-marker:${marker}` }
  }

  return { ok: true, text: value }
}

async function loadProfile(directory, config) {
  if (!config.profilePath) {
    return { ok: true, profile: null }
  }

  const profilePath = resolvePath(directory, config.profilePath)
  if (!(await exists(profilePath))) {
    return { ok: false, reason: "profile-missing", profilePath }
  }

  const profile = await readJson(profilePath)
  const normalized = {
    ...profile,
    referenceAudioPath: resolvePath(directory, profile.referenceAudioPath),
    promptAudioPath: resolvePath(directory, profile.promptAudioPath),
  }

  if (normalized.referenceAudioPath && !(await exists(normalized.referenceAudioPath))) {
    return { ok: false, reason: "reference-audio-missing", profilePath, referenceAudioPath: normalized.referenceAudioPath }
  }

  if (normalized.promptAudioPath && !(await exists(normalized.promptAudioPath))) {
    return { ok: false, reason: "prompt-audio-missing", profilePath, promptAudioPath: normalized.promptAudioPath }
  }

  return { ok: true, profile: normalized, profilePath }
}

function buildBridgeRequest(text, profile, config) {
  return {
    text,
    provider: config.provider,
    profile: profile || {},
    playback: config.playback,
  }
}

async function runCommand(command, input, timeoutMs) {
  return await new Promise((resolve) => {
    const [bin, ...args] = command
    const child = spawn(bin, args, { stdio: ["pipe", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    let done = false

    const finish = (value) => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve(value)
    }

    const timer = setTimeout(() => {
      child.kill("SIGTERM")
      finish({ ok: false, reason: "timeout", stderr })
    }, timeoutMs)

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk)
    })

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    child.on("error", (error) => {
      finish({ ok: false, reason: "spawn-error", stderr: error.message })
    })

    child.on("close", (code) => {
      if (code !== 0) {
        finish({ ok: false, reason: "non-zero-exit", code, stderr })
        return
      }
      try {
        finish({ ok: true, result: JSON.parse(stdout || "{}"), stderr })
      } catch (error) {
        finish({ ok: false, reason: "invalid-json", stderr: `${stderr}\n${error.message}`.trim() })
      }
    })

    child.stdin.write(JSON.stringify(input))
    child.stdin.end()
  })
}

async function synthesizeMock(text) {
  return {
    ok: true,
    mode: "mock",
    spokenText: text,
  }
}

async function synthesizeVoxBridge(text, profile, config) {
  const command = config.voxcpmBridge.command || []
  if (!Array.isArray(command) || command.length === 0) {
    return { ok: false, reason: "missing-bridge-command" }
  }

  const request = buildBridgeRequest(text, profile, config)
  const bridge = await runCommand(command, request, config.voxcpmBridge.timeoutMs)
  if (!bridge.ok) return bridge

  const audioPath = bridge.result.audioPath ? String(bridge.result.audioPath) : null
  if (!audioPath) {
    return { ok: false, reason: "missing-audio-path", bridge: bridge.result }
  }

  return {
    ok: true,
    mode: "voxcpm-bridge",
    audioPath,
    bridge: bridge.result,
  }
}

async function playAudio(audioPath, playback) {
  if (playback.mode === "none") {
    return { ok: true, skipped: "playback-disabled" }
  }

  const command = playback.command || []
  if (!Array.isArray(command) || command.length === 0) {
    return { ok: false, reason: "missing-playback-command" }
  }

  if (activePlayback) {
    activePlayback.kill("SIGTERM")
    activePlayback = null
  }

  return await new Promise((resolve) => {
    const finalCommand = command.map((part) => (part === "$AUDIO_PATH" ? audioPath : part))
    const [bin, ...args] = finalCommand
    const child = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] })
    activePlayback = child
    let stderr = ""

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    child.on("error", (error) => {
      activePlayback = null
      resolve({ ok: false, reason: "playback-spawn-error", stderr: error.message })
    })

    child.on("close", (code) => {
      if (activePlayback === child) activePlayback = null
      if (code !== 0) {
        resolve({ ok: false, reason: "playback-non-zero-exit", code, stderr })
        return
      }
      resolve({ ok: true })
    })
  })
}

async function synthesize(text, profile, config) {
  switch (config.provider) {
    case "mock":
      return synthesizeMock(text)
    case "voxcpm-bridge":
      return synthesizeVoxBridge(text, profile, config)
    default:
      return { ok: false, reason: `unknown-provider:${config.provider}` }
  }
}

export const VoiceOutputPlugin = async ({ client, directory }) => {
  await log(client, "info", "Voice output plugin initialized", {
    defaultConfigPath: DEFAULT_CONFIG_PATH,
  })

  return {
    "experimental.text.complete": async (input, output) => {
      const generation = ++activeGeneration
      const { config, configPath, source } = await loadConfig(directory)

      if (!config.enabled) {
        await log(client, "debug", "Voice output skipped because feature is disabled", { configPath, source })
        return
      }

      const eligibility = isEligibleText(output.text, config.filters)
      if (!eligibility.ok) {
        await log(client, "info", "Voice output skipped by eligibility filter", { reason: eligibility.reason, sessionID: input.sessionID })
        return
      }

      const profile = await loadProfile(directory, config)
      if (!profile.ok) {
        await log(client, "warn", "Voice output skipped because profile validation failed", profile)
        return
      }

      const result = await synthesize(eligibility.text, profile.profile, config)
      if (generation !== activeGeneration) {
        await log(client, "info", "Voice output dropped because a newer response replaced it", { sessionID: input.sessionID })
        return
      }

      if (!result.ok) {
        await log(client, "warn", "Voice synthesis failed; text response preserved", result)
        return
      }

      if (!result.audioPath) {
        await log(client, "info", "Voice synthesis completed without audio playback", { mode: result.mode, preview: eligibility.text.slice(0, 120) })
        return
      }

      const playback = await playAudio(result.audioPath, config.playback)
      if (!playback.ok) {
        await log(client, "warn", "Voice playback failed; text response preserved", playback)
        return
      }

      await log(client, "info", "Voice playback completed", { mode: result.mode, audioPath: result.audioPath })
    },
  }
}

export default VoiceOutputPlugin
