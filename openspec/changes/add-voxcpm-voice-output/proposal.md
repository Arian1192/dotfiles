## Why

OpenCode currently returns text only, so adding spoken playback would make replies feel more personal and hands-free. Using VoxCPM with a cloned voice is technically plausible, but it crosses model serving, audio generation, plugin lifecycle, UX controls, and safety boundaries, so the work needs a deliberate design before implementation.

## What Changes

- Add a plugin-driven voice output path that can synthesize spoken playback for assistant final responses.
- Define a provider abstraction so OpenCode can target VoxCPM first without hard-coding the rest of the system to one TTS engine.
- Add configuration for enabling voice output, selecting a voice backend, and referencing a local cloned-voice profile.
- Define response filtering rules so only eligible assistant outputs are spoken by default, with clear exclusions for tool traces, secrets, and verbose coordination content.
- Add failure handling and fallback behavior so text responses continue normally when the voice backend is unavailable, slow, or unsafe to use.

## Capabilities

### New Capabilities
- `voice-response-plugin`: Plugin-based spoken rendering of assistant final responses with provider selection, response filtering, and graceful fallback to text.
- `voice-clone-profile`: Local voice-profile configuration and safety constraints for cloned-voice playback backends such as VoxCPM.

### Modified Capabilities
- `hybrid-agent-cell`: Final output handling may optionally include a post-response voice rendering step without changing the contract-first routing model.

## Impact

- OpenCode plugin system and runtime hooks
- User-facing output policy and response lifecycle
- Local configuration in `opencode.jsonc`
- External dependencies for VoxCPM serving or CLI invocation
- Audio playback/runtime integration, temporary file handling, and failure fallback
- Safety/privacy constraints around cloned voices and spoken content
