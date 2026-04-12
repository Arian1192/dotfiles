import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const VALID_MODES = new Map([
  ["off", false],
  ["summary", true],
  ["full", true],
])

const mode = process.argv[2]

if (!VALID_MODES.has(mode)) {
  console.error("Usage: node ./plugins/set-voice-mode.mjs <off|summary|full>")
  process.exit(1)
}

const scriptPath = fileURLToPath(import.meta.url)
const pluginsDir = path.dirname(scriptPath)
const configPath = path.join(pluginsDir, "voice-output.config.json")

let config
let raw

try {
  raw = await fs.readFile(configPath, "utf8")
} catch (error) {
  console.error(`Could not read voice config at ${configPath}: ${error.message}`)
  process.exit(1)
}

try {
  config = JSON.parse(raw)
} catch (error) {
  console.error(`Voice config is not valid JSON at ${configPath}: ${error.message}`)
  process.exit(1)
}

if (!config || typeof config !== "object" || Array.isArray(config)) {
  console.error(`Voice config must be a JSON object at ${configPath}`)
  process.exit(1)
}

config.mode = mode
config.enabled = VALID_MODES.get(mode)

await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8")

console.log(
  JSON.stringify({
    ok: true,
    configPath,
    mode: config.mode,
    enabled: config.enabled,
  }),
)
