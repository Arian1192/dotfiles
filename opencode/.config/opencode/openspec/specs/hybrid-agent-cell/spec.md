## ADDED Requirements

### Requirement: Contract-first execution
The system SHALL define a shared contract and acceptance criteria before a task is executed through parallel implementation subagents. The shared contract MUST identify interface expectations, ownership boundaries, and the version that all participating agents are implementing.

#### Scenario: Parallel execution requires a shared contract
- **WHEN** the dispatcher selects a parallel execution path for a task that spans multiple implementation domains
- **THEN** the system creates or updates a shared contract before backend, frontend, or other implementation subagents begin work

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


### Requirement: Bounded A2A collaboration
Implementation subagents SHALL be able to exchange structured coordination messages through bounded A2A collaboration. These messages MUST reference the active contract version and SHALL be limited to implementation coordination, dependency negotiation, blocker reporting, and contract-change proposals.

#### Scenario: Frontend and backend negotiate a contract update
- **WHEN** the frontend implementer discovers that the active response schema does not satisfy the agreed user flow
- **THEN** the frontend implementer sends a structured contract-change proposal that references the current contract version and affected artifacts

### Requirement: Integrator enforces convergence
The system SHALL include an integrator role that evaluates partial work against the shared contract, acceptance criteria, and validation results. The integrator MUST be able to reject incomplete or incompatible outputs and return work to the responsible implementation subagent.

#### Scenario: Integrator returns non-conforming work
- **WHEN** backend and frontend outputs cannot satisfy the shared acceptance criteria after integration
- **THEN** the integrator rejects the partial delivery and sends explicit rework instructions to the responsible subagent or subagents

### Requirement: Hybrid security role
The system SHALL include a security role that acts as a design advisor before implementation for sensitive tasks and as a gatekeeper after integration before final delivery. For tasks involving authentication, authorization, secrets, or session boundaries, this security role MUST participate in both phases.

#### Scenario: Security advises before and gates after an auth change
- **WHEN** the dispatcher classifies a task as involving authentication or authorization behavior
- **THEN** the security role participates during contract design and blocks final delivery if post-integration security checks fail

### Requirement: Clear OpenCode agent placement
Primary agents SHALL be defined in `~/.config/opencode/opencode.jsonc`, and specialized subagents SHALL be defined as markdown files in `~/.config/opencode/agents/`. Internal subagents that should not clutter interactive selection SHOULD be marked with `mode: subagent` and `hidden: true` when supported.

#### Scenario: Configuration keeps the main UI focused
- **WHEN** a maintainer opens OpenCode with this architecture configured
- **THEN** the primary UI exposes only the intended primary agents while specialist subagents remain organized under `~/.config/opencode/agents/`

### Requirement: Traceable coordination and outcomes
The system SHALL preserve traceability for contract versions, coordination messages, integrator decisions, and security gates so maintainers can understand why work was accepted, rejected, or escalated.

#### Scenario: A rejected integration remains explainable
- **WHEN** the integrator rejects a partial implementation because acceptance criteria are not met
- **THEN** the system records the relevant contract version, validation failures, and the reason for the rework decision
