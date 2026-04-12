## Why

The current voice experiment can read full assistant replies aloud, but long spoken answers feel slow and artificial. A better user experience is to keep the full text on screen while speaking only a short summary, and to let that audio behavior be switched on or off from OpenCode without hand-editing JSON files.

## What Changes

- Add configurable voice output modes: `off`, `summary`, and `full`.
- Add a spoken-summary path so OpenCode can keep the full textual explanation while sending only a concise summary to the voice backend in `summary` mode.
- Add a simple local control surface inside OpenCode to switch voice mode without manually editing plugin config files.
- Keep the existing audio fallback behavior so text remains authoritative when summary generation, synthesis, or playback fails.

## Capabilities

### New Capabilities
- `voice-mode-control`: Local user control for switching voice behavior between disabled, spoken-summary, and full-response playback.

### Modified Capabilities
- `voice-response-plugin`: Voice playback requirements expand from “speak eligible response text” to “support full or summary speech output modes while preserving full text on screen.”

## Impact

- `plugins/voice-output.js` and the local voice config schema
- local command/control files for switching voice mode from OpenCode
- prompt/response formatting rules for spoken summaries
- validation of off/summary/full behavior with VoxCPM playback
