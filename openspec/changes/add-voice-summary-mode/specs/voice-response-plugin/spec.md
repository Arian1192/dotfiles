## MODIFIED Requirements

### Requirement: Opt-in spoken rendering of final assistant responses
The system SHALL support configurable voice modes for final user-facing assistant responses after the text response has been produced.

#### Scenario: Voice output is disabled by mode
- **WHEN** the configured voice mode is `off`
- **THEN** the system returns normal text responses and does not attempt speech synthesis or playback

#### Scenario: Summary mode speaks only the spoken summary
- **WHEN** the configured voice mode is `summary` and the assistant output contains a spoken-summary block
- **THEN** the system preserves the full text response for reading and synthesizes only the spoken-summary block

#### Scenario: Full mode speaks the full eligible response
- **WHEN** the configured voice mode is `full`
- **THEN** the system preserves the full text response and synthesizes the full eligible response body

#### Scenario: Summary mode handles missing summary block safely
- **WHEN** the configured voice mode is `summary` but the assistant output does not contain a spoken-summary block
- **THEN** the system falls back to a defined safe policy without blocking the text response
