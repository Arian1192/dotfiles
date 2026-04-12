## ADDED Requirements

### Requirement: Persistent bridge server lifecycle

The voice output plugin SHALL launch a long-lived bridge server process on first synthesis request and keep it alive across subsequent requests for a configurable idle period.

#### Scenario: Server starts lazily on first request

- **WHEN** a text response triggers voice synthesis and no bridge server is running
- **THEN** the plugin launches the bridge server, waits for it to become ready, sends the synthesis request, and plays the resulting audio

#### Scenario: Server persists across multiple requests

- **WHEN** a second text response triggers voice synthesis while the bridge server is still running
- **THEN** the plugin reuses the existing server connection and plays the audio without reloading the model

#### Scenario: Server shuts down after idle period

- **WHEN** no synthesis requests are received for the configured idle period (default: 5 minutes)
- **THEN** the bridge server shuts down gracefully and the next request triggers a fresh startup

### Requirement: Clean stdout / stderr separation

The bridge server SHALL write only valid JSON to stdout and all diagnostic/log output to stderr.

#### Scenario: Plugin parses JSON response correctly

- **WHEN** the bridge server completes a synthesis request
- **THEN** stdout contains only a single JSON object with `audioPath` and the plugin successfully parses it with `JSON.parse`

#### Scenario: Plugin logs show bridge diagnostics

- **WHEN** the bridge server runs model loading, warm-up, or inference
- **THEN** those messages appear on stderr and the plugin logs them at debug level without affecting JSON parsing

### Requirement: Per-phase latency reporting

The bridge server SHALL include optional per-phase timing in the JSON response.

#### Scenario: Response includes timing breakdown

- **WHEN** the bridge server completes a synthesis request
- **THEN** the JSON response MAY include a `timing` object with numeric fields `loadMs`, `warmupMs`, `synthesisMs`, `encodeMs`, and `totalMs`

#### Scenario: Plugin logs latency metrics when available

- **WHEN** the bridge JSON response contains a `timing` object
- **THEN** the plugin logs each phase duration at debug level

### Requirement: Graceful fallback on bridge failure

The voice output plugin SHALL preserve the text response when the bridge fails or times out.

#### Scenario: Bridge process unavailable

- **WHEN** the bridge server is not running and the CLI bridge also fails or times out
- **THEN** the plugin logs a warning, preserves the full text response, and does not block or error

#### Scenario: Bridge returns invalid JSON

- **WHEN** the bridge stdout is not valid JSON
- **THEN** the plugin logs the raw stdout at warn level, preserves the text response, and does not block

### Requirement: Backward compatibility with existing modes

The performance improvements SHALL NOT change the behavior of `off`, `summary`, or `full` modes.

#### Scenario: Off mode skips all synthesis

- **WHEN** `mode` is set to `off` in the local config
- **THEN** the plugin skips synthesis entirely and the text response is delivered without any audio

#### Scenario: Summary mode extracts spoken summary block

- **WHEN** `mode` is set to `summary` and the response contains `## Resumen hablado`
- **THEN** only the content of that block is synthesized and played; the full text is preserved on screen

#### Scenario: Full mode speaks eligible response text

- **WHEN** `mode` is set to `full`
- **THEN** the full eligible response text is synthesized and played while the full text remains visible
