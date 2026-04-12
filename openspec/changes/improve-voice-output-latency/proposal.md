## Why

The current VoxCPM voice output works end-to-end, but the spoken response starts too late for an interactive workflow. We need to turn the experiment into a responsive feature by reducing startup latency, making failures easier to diagnose, and preserving the existing text-first behavior.

## What Changes

- Add a persistent voice synthesis path so the voice model does not need to cold-start on every response.
- Add latency measurement and structured diagnostics for synthesis and playback stages.
- Define fallback behavior when the low-latency path is unavailable or unhealthy.
- Preserve the existing `off`, `summary`, and `full` modes while improving their responsiveness.
- Validate the improved path against real interactive usage, not just isolated bridge tests.

## Capabilities

### New Capabilities
- `voice-output-performance`: Defines responsiveness, diagnostics, and fallback behavior for spoken responses.

### Modified Capabilities
- None.

## Impact

- Affected code: `plugins/voice-output.js`, `plugins/voxcpm_bridge.py`, local command flow, and supporting scripts/config.
- Affected systems: local VoxCPM runtime, model lifecycle management, audio playback timing, and plugin logging.
- Validation impact: requires measuring end-to-end latency in real OpenCode sessions and verifying degraded-mode behavior.
