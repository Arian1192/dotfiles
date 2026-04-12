# Voice output plugin experiment

This is a local experimental plugin for post-response voice playback.

## Current scope

- disabled by default
- plugin-based and text-first
- filters to user-facing final text only
- supports a `mock` provider and a local `voxcpm-bridge` provider contract
- preserves normal text responses if synthesis or playback fails

## Files

- `plugins/voice-output.js` — plugin implementation
- `plugins/voice-output.config.json` — local plugin config
- `plugins/voice-output.profile.example.json` — example cloned-voice profile
- `plugins/voxcpm_bridge_stub.py` — local stub bridge using macOS `say`

## Config

The plugin reads `plugins/voice-output.config.json` by default.

You can override it per run with:

```bash
OPENCODE_VOICE_OUTPUT_CONFIG=/absolute/path/to/config.json opencode
```

## Provider modes

### mock

- synthesizes nothing
- logs what would have been spoken
- useful to validate filters and non-fatal behavior

### voxcpm-bridge

- calls an external local bridge command
- sends JSON on stdin
- expects JSON on stdout with at least:

```json
{
  "audioPath": "/absolute/path/to/audio-file"
}
```

The included `voxcpm_bridge_stub.py` is a bridge-contract test double, not real VoxCPM.
It uses macOS `say` to generate an `.aiff` file so the playback path can be validated end-to-end.

## Real VoxCPM path later

Replace the stub bridge with a real local VoxCPM bridge that:

1. receives assistant response text plus profile metadata
2. loads local reference audio / optional prompt transcript
3. synthesizes audio with VoxCPM
4. returns `audioPath` to the plugin

## Why config is separate from opencode.jsonc

OpenCode's config schema does not currently allow arbitrary top-level plugin-specific keys.
To avoid breaking normal config validation, this experiment keeps voice settings in a dedicated local JSON file.
