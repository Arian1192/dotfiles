## ADDED Requirements

### Requirement: Local cloned-voice profile configuration
The system SHALL support a local voice profile for cloned-voice backends that identifies the selected provider, required local assets, and provider-specific synthesis settings.

#### Scenario: Local profile references voice assets
- **WHEN** a user enables cloned-voice playback
- **THEN** the system loads the configured local profile that points to the required reference audio and any optional transcript or style metadata needed by the provider

#### Scenario: Invalid voice profile is non-fatal
- **WHEN** the configured voice profile is missing, unreadable, or incomplete
- **THEN** the system disables spoken playback for that run and preserves normal text responses without crashing OpenCode

### Requirement: Local-only handling of sensitive voice assets
The system SHALL treat cloned-voice assets as local-sensitive configuration and SHALL NOT require them to be embedded directly in prompts or transmitted by default.

#### Scenario: Voice assets stay out of prompts
- **WHEN** the system prepares a speech-synthesis request
- **THEN** it references local profile metadata and provider inputs without copying raw voice assets into normal prompt text or agent instructions

#### Scenario: Default behavior avoids remote sharing
- **WHEN** a cloned-voice profile is configured for local playback
- **THEN** the system keeps asset handling local by default unless the user explicitly configures an external provider path

### Requirement: VoxCPM-compatible provider inputs
The first cloned-voice provider SHALL support VoxCPM-compatible inputs for normal TTS, reference-audio cloning, and optional transcript-guided cloning modes.

#### Scenario: Reference-audio cloning is supported
- **WHEN** the selected provider is VoxCPM and the profile supplies a reference audio path
- **THEN** the provider can synthesize speech using the configured cloned voice for the assistant response text

#### Scenario: Transcript-guided cloning is optional
- **WHEN** the selected provider is VoxCPM and the profile also supplies a transcript for the reference clip
- **THEN** the provider may use the transcript-guided cloning path without requiring all voice profiles to provide one
