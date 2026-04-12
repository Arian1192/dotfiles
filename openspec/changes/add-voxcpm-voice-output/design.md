## Context

OpenCode currently ends its response lifecycle at rendered text. The proposed voice feature adds a post-response step that may synthesize and play spoken audio for the final assistant answer, starting with VoxCPM and a local cloned-voice profile. This is a cross-cutting change because it touches plugin/runtime hooks, local configuration, external model serving, content filtering, playback behavior, and safety rules.

VoxCPM is capable enough for the target experience, but it brings heavyweight Python and model-serving dependencies that should not be embedded directly into the main OpenCode runtime. The design therefore needs to keep the core tool usable when voice is disabled, unavailable, slow, or misconfigured.

## Goals / Non-Goals

**Goals:**
- Add an opt-in voice output path for assistant final responses.
- Support VoxCPM as the first provider for cloned-voice playback.
- Keep OpenCode functional when voice output is disabled or fails.
- Ensure only safe, user-facing content is eligible for speech by default.
- Keep provider integration replaceable so future TTS engines can reuse the same plugin contract.

**Non-Goals:**
- Reading tool traces, subagent coordination, or internal debugging output aloud.
- Shipping a cloud voice service as the first version.
- Training or hosting voice-cloning models inside the OpenCode process.
- Guaranteeing real-time synthesis in the first release.
- Solving cross-device voice synchronization or remote audio playback in v1.

## Decisions

### 1. Use a plugin-driven post-response hook
- Decision: Implement voice as a plugin/runtime extension that runs after the final assistant response is produced.
- Why: This keeps the main text path authoritative and makes voice an optional side effect rather than a core dependency.
- Alternative considered: Replacing the response renderer with an audio-first flow. Rejected because it increases blast radius and risks breaking normal text use.

### 2. Define a provider abstraction and start with VoxCPM
- Decision: Add a provider interface with a VoxCPM adapter as the first implementation.
- Why: VoxCPM is a strong initial target, but hard-coding the feature to a single engine would make future experimentation harder.
- Alternative considered: Building specifically for VoxCPM only. Rejected because the integration cost is similar, but the long-term flexibility is worse.

### 3. Prefer an external local bridge over in-process model execution
- Decision: The plugin should call a local provider bridge (CLI or HTTP sidecar) rather than importing VoxCPM directly into OpenCode.
- Why: VoxCPM has Python, PyTorch, and model/runtime constraints; isolating them avoids contaminating the main runtime and simplifies rollback.
- Alternative considered: Running VoxCPM in-process. Rejected because dependency weight and failure modes are too invasive.

### 4. Keep voice output opt-in and off by default
- Decision: Add config for `voice.enabled`, provider selection, playback mode, and voice profile, but default the feature to disabled.
- Why: This allows safe experimentation without breaking existing OpenCode usage.
- Alternative considered: Auto-enable when configuration is partially present. Rejected because accidental audio output would be disruptive.

### 5. Speak only final user-facing assistant answers by default
- Decision: The filter policy should only allow final assistant answers, and should exclude tool output, coordination traces, validation logs, and content marked sensitive.
- Why: This protects clarity and privacy while matching the user expectation of “read Opencode’s answer aloud.”
- Alternative considered: Reading everything. Rejected due to noise, latency, and leakage risk.

### 6. Store cloned-voice configuration locally, not inline in prompts
- Decision: Reference a local voice profile that points to assets such as reference audio, optional prompt transcript, and provider-specific parameters.
- Why: Voice assets are sensitive, large, and operationally distinct from text configuration.
- Alternative considered: Embedding raw voice parameters directly in prompts or normal config fields. Rejected due to security and maintainability concerns.

### 7. Fail open to text, fail closed for audio
- Decision: If synthesis, playback, or provider availability fails, OpenCode should still return text normally and record a bounded warning instead of blocking the response.
- Why: The voice layer is additive, not mission-critical.
- Alternative considered: Treating failed audio generation as a full response failure. Rejected because it would degrade the stable experience.

## Risks / Trade-offs

- [Risk] VoxCPM dependencies may be heavy or GPU-sensitive on the target machine. → Mitigation: isolate the provider as a separate local bridge and keep the feature disabled by default.
- [Risk] Spoken playback could read sensitive or noisy content aloud. → Mitigation: filter to final user-facing responses only, with explicit exclusions and a local-only initial mode.
- [Risk] Cloned-voice assets are sensitive and could be misused. → Mitigation: keep profiles local, document consent expectations, and avoid automatic syncing or sharing.
- [Risk] Audio generation latency may feel worse than the text-first experience. → Mitigation: text remains immediate; audio starts opportunistically after text is available.
- [Risk] Multiple responses could overlap and create confusing playback. → Mitigation: define a single-playback queue with cancel/replace behavior for newer responses.
- [Risk] Provider-specific assumptions could leak into the plugin contract. → Mitigation: keep the provider interface minimal and engine-agnostic.

## Migration Plan

1. Add config schema and plugin hooks with the voice path disabled by default.
2. Implement the provider abstraction and a mock/local test provider first.
3. Add the VoxCPM bridge and cloned-voice profile loading.
4. Add response filtering, playback controls, and bounded warnings.
5. Validate that text-only behavior remains unchanged when voice is disabled or broken.
6. Roll back by disabling `voice.enabled` or removing the provider configuration without affecting text output.

## Open Questions

- Should the first VoxCPM bridge be CLI-based, HTTP-based, or support both?
- Do we want streaming playback in v1, or only file-based synthesis after the full response is ready?
- Which local playback mechanism is the safest cross-platform baseline for macOS-first usage?
- How should users explicitly mark a response as “do not speak” beyond default filtering?
- Should cloned-voice assets live under `~/.config/opencode/` or an external user-specified path?
