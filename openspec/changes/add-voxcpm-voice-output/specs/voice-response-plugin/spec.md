## ADDED Requirements

### Requirement: Opt-in spoken rendering of final assistant responses
The system SHALL support an opt-in voice response plugin that can synthesize spoken playback for final user-facing assistant responses after the text response has been produced.

#### Scenario: Voice output is disabled by default
- **WHEN** OpenCode runs without explicit voice-output enablement
- **THEN** the system returns normal text responses and does not attempt speech synthesis or playback

#### Scenario: Voice output runs after final text is available
- **WHEN** voice output is enabled and the assistant produces a final user-facing answer
- **THEN** the system first preserves the text response and then triggers the configured voice rendering path as a post-response step

### Requirement: Response filtering for spoken playback
The system SHALL apply a response eligibility policy so only approved assistant content is spoken by default.

#### Scenario: Internal or noisy content is excluded
- **WHEN** a response segment contains tool traces, bounded coordination messages, validation logs, or other non-user-facing runtime content
- **THEN** the voice plugin skips those segments and does not speak them by default

#### Scenario: Sensitive content is not spoken automatically
- **WHEN** a response or metadata path marks content as sensitive or unsafe for audible playback
- **THEN** the voice plugin suppresses automatic speech for that content and leaves the text response intact

### Requirement: Provider abstraction with graceful fallback
The system SHALL use a provider abstraction for speech synthesis and SHALL preserve normal text behavior if the selected provider is unavailable, slow, or fails.

#### Scenario: Provider failure does not block text delivery
- **WHEN** the configured voice provider cannot synthesize or return playable audio
- **THEN** the system still delivers the text response and emits only a bounded warning or failure status for the audio path

#### Scenario: Provider selection remains configurable
- **WHEN** a user changes the configured voice provider
- **THEN** the voice plugin uses the new provider through the same plugin contract without requiring the text response path to change

### Requirement: Playback coordination
The system SHALL avoid overlapping assistant speech playback from concurrent or rapidly successive responses.

#### Scenario: New playback replaces stale playback
- **WHEN** a new eligible assistant response arrives while older synthesized audio is still pending or playing
- **THEN** the system cancels, replaces, or serializes playback according to a single defined policy so speech does not overlap unpredictably
