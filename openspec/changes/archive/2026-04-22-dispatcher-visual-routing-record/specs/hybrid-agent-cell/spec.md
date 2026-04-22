## MODIFIED Requirements

### Requirement: Dispatcher-controlled execution mode
The system SHALL use a primary dispatcher to classify incoming work and choose between a single-agent path and a parallel work-cell path. The dispatcher MUST prefer the simpler path unless the task crosses domain boundaries or benefits materially from parallel implementation. The dispatcher MUST remain a routing and coordination role and MUST NOT author implementation changes or product-code edits itself. When it makes an execution-path decision, it MUST emit an operator-visible routing record that identifies the selected path, confirms the Dispatcher is coordination-only, names the implementation owner if any, and references the applicable contract version.

#### Scenario: Dispatcher keeps simple work on the cheap path
- **WHEN** a request can be completed by one implementation agent without cross-domain coordination
- **THEN** the dispatcher routes the request through the single-agent execution path instead of creating a parallel work cell

#### Scenario: Dispatcher does not implement while routing
- **WHEN** the dispatcher selects either the single-agent path or the parallel work-cell path
- **THEN** it limits itself to routing, contract setup, coordination, and validation handoff rather than producing implementation artifacts itself

#### Scenario: Dispatcher shows a routing record
- **WHEN** the dispatcher selects an execution path for a task
- **THEN** it emits a visible routing record with the path, `Dispatcher Role: coordination-only`, the implementation owner, the contract version or `n/a`, and the routing reason
