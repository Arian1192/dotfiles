## ADDED Requirements

### Requirement: Voice mode control from inside OpenCode
The system SHALL provide a local control surface inside OpenCode that lets the user switch voice behavior without manually editing plugin JSON files.

#### Scenario: Disable voice playback from OpenCode
- **WHEN** the user triggers the local command for disabling voice playback
- **THEN** the local voice config is updated so future assistant responses do not synthesize or play audio

#### Scenario: Enable spoken-summary mode from OpenCode
- **WHEN** the user triggers the local command for spoken-summary mode
- **THEN** the local voice config is updated so future eligible responses preserve full text and speak only the spoken-summary block

#### Scenario: Enable full-response mode from OpenCode
- **WHEN** the user triggers the local command for full-response voice mode
- **THEN** the local voice config is updated so future eligible responses preserve full text and speak the full response body
