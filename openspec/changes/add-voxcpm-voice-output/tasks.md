## 1. Voice plugin foundation

- [x] 1.1 Identify the OpenCode hook/plugin boundary where final assistant responses can trigger optional post-response side effects.
- [x] 1.2 Add configuration fields for voice enablement, provider selection, playback mode, and local voice-profile reference with the feature disabled by default.
- [x] 1.3 Implement a provider abstraction and a no-op or mock provider so the text path can be validated independently from VoxCPM.

## 2. VoxCPM provider integration

- [ ] 2.1 Implement a local VoxCPM bridge contract (CLI or HTTP sidecar) that accepts response text plus cloned-voice profile inputs and returns playable audio.
- [x] 2.2 Add loading and validation for local cloned-voice profile assets, including reference audio and optional transcript-guided cloning fields.
- [x] 2.3 Handle provider failures, timeouts, and unavailable dependencies so text responses still complete normally.

## 3. Playback and filtering behavior

- [x] 3.1 Implement response eligibility filtering so only final user-facing assistant answers are spoken by default.
- [x] 3.2 Exclude tool traces, coordination messages, validation logs, and content marked sensitive from automatic spoken playback.
- [x] 3.3 Implement playback coordination so overlapping responses are canceled, replaced, or serialized by one defined policy.

## 4. Safety, validation, and rollout

- [x] 4.1 Add bounded warnings and observability for voice synthesis success, skip, and failure outcomes without exposing sensitive voice assets.
- [ ] 4.2 Validate the disabled-by-default path, successful local playback path, invalid-profile path, and provider-failure fallback path.
- [x] 4.3 Document local setup requirements for VoxCPM, cloned-voice profile handling, and the safe experimental rollout/rollback procedure.
