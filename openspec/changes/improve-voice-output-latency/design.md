## Context

The current voice output plugin works end-to-end: it reads the response, extracts text, calls VoxCPM via a bridge subprocess, and plays the generated audio. The core pipeline is sound. The problem is latency.

On every response, the VoxCPM bridge:
1. Spawns a new Python subprocess
2. Imports the `voxcpm` package and its dependencies (torch, torchaudio, safetensors, etc.)
3. Downloads the model weights if not cached (first run only, but still adds overhead)
4. Loads the model from disk into memory (AudioVAE + TTS model)
5. Runs a warm-up pass (10 inference steps)
6. Generates audio (12–172 steps depending on text length)
7. Encodes the waveform to a temporary WAV file
8. Returns the path as JSON on stdout

Steps 1–5 happen on every single response. For a 30-second audio clip, the synthesis alone (step 7) takes 30–60 seconds on Apple Silicon MPS. The total wall-clock time from text completion to audio playback can exceed 90 seconds in the worst case, making the feature feel broken even when it works.

The plugin already has a `mode` field (`off`, `summary`, `full`) and a `voxcpmBridge` section that points to a CLI command. The config is at `plugins/voice-output.config.json`.

## Goals / Non-Goals

**Goals:**
- Reduce perceived latency from response completion to audio playback to under 10 seconds for typical summary-length text.
- Provide structured diagnostics so failures are identifiable and actionable, not silent.
- Preserve the existing `off`, `summary`, and `full` modes without breaking them.
- Ensure the text response is always delivered first; audio is always additive.

**Non-Goals:**
- Replacing VoxCPM with a different TTS engine.
- Streaming audio before the text response is complete (would require OpenCode-side streaming hooks that do not currently exist).
- Zero-latency audio (physically impossible without pre-computation).
- Changing the voice profile or cloning pipeline.

## Decisions

### 1. Persistent bridge process with lazy initialization

**Decision:** Replace the spawn-per-response bridge subprocess with a long-lived bridge server process that stays resident between synthesis requests.

**Rationale:** The dominant cost in the current pipeline is startup: Python interpreter spin-up, package imports, and model loading. Keeping the process alive across requests amortizes this cost to zero after the first request. A warm-up pass is still needed on first use, but subsequent requests skip directly to generation.

**Alternatives considered:**

| Approach | Latency benefit | Complexity | Failure isolation |
|---|---|---|---|
| Spawn per request (current) | None | Low | High |
| Persistent server process | High | Medium | Medium |
| Model pre-loading in plugin | Medium | High (plugin architecture) | Low |
| Cached audio responses | High for repeated text | Medium (keying strategy) | N/A |

A persistent server process gives the best latency improvement for the least architectural complexity. Model pre-loading in the plugin would require changes to how OpenCode loads plugins and manages their lifecycle, which is out of scope.

**Implementation:** The bridge subprocess is replaced by a bridge server that listens on a Unix domain socket or localhost TCP port. On startup it loads the model and runs warm-up once. The plugin connects, sends a synthesis request, receives the audio path, and the connection stays open for reuse. The server is started lazily on first synthesis request and kept alive for a configurable idle period (e.g., 5 minutes) before shutting down gracefully.

### 2. Structured JSON logging to stderr, clean JSON to stdout

**Decision:** All diagnostic output (model loading, warm-up, inference progress, errors) goes to stderr. Only the final JSON result is written to stdout.

**Rationale:** The current bridge mixes VoxCPM model loading logs with the JSON response on stdout in some conditions. The plugin does `JSON.parse(stdout)` and any unexpected output before or after the JSON causes silent failure. Separating streams ensures the plugin can reliably parse the response while all verbose logs are available for debugging via `stderr`.

**Implementation:** Replace `print()` calls in `voxcpm_bridge.py` that output to stdout with `sys.stderr.write()` or `logging` module output to stderr. Only the final `json.dumps(result)` goes to stdout.

### 3. Latency budget logging

**Decision:** The bridge reports per-phase timing (model load, warm-up, synthesis, encoding) in the JSON response as optional fields.

**Rationale:** Without measurable data, latency optimization is guesswork. Adding timing to the response lets the plugin (and any diagnostic logs) show where time is spent. This is the cheapest way to build a performance baseline before deeper optimization.

**Implementation:** Add an optional `timing` object to the bridge JSON response: `{ loadMs, warmupMs, synthesisMs, encodeMs, totalMs }`. The plugin logs these values when present.

### 4. Fallback to stub bridge when main bridge is unavailable

**Decision:** If the persistent bridge server is not running and the direct CLI bridge fails or times out, fall back to a silent stub that logs the intended text but produces no audio.

**Rationale:** The text response must always succeed. If audio fails, the experience degrades gracefully to text-only, matching the `off` mode behavior without requiring the user to switch modes manually.

**Implementation:** The plugin already has a `mock` provider that does nothing. The `voxcpm-bridge` provider can be extended to catch bridge failures and log a warning while preserving the text output.

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Persistent server process accumulates memory over time | Medium | Medium | Set a maximum lifetime and restart idle server after N minutes |
| Bridge server crashes and leaves plugin without audio | Low | Low | Plugin falls back to stub, text response preserved; auto-restart on next request |
| Mixing stdout/stderr streams in pipes breaks existing tests | Low | Low | Existing tests use isolated bridge calls; update test assertions to expect clean stdout |
| Apple Silicon MPS performance is inconsistent under load | Medium | Medium | Keep inference steps configurable; allow user to reduce quality for speed |
| Cold-start on first request after server restart is still slow | Low | Low | Accept as one-time cost; communicate expected first-run delay in diagnostics |
