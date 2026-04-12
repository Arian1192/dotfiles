## Why

We need an agent architecture for OpenCode that supports real multi-surface development work without paying the constant cost and coordination overhead of a fully connected multi-agent mesh. This change defines a contract-first hybrid pattern now so future agent configuration can scale to backend/frontend/security workflows while preserving control, explainability, and fast onboarding.

## What Changes

- Define a contract-first hybrid agent architecture for OpenCode centered on a primary `dispatcher` and a bounded parallel work cell.
- Introduce a shared contract and acceptance-criteria model that must be established before subagents can parallelize implementation.
- Define bounded A2A coordination between subagents so backend and frontend specialists can negotiate interface changes and dependencies without becoming an uncontrolled mesh.
- Add an `integrator` role with authority to reject partial work and send implementation back when acceptance criteria are not met.
- Define a hybrid `security` role that participates as an advisor before implementation and a gatekeeper after integration.
- Establish the intended OpenCode configuration layout: primary agents in `~/.config/opencode/opencode.jsonc` and subagents in `~/.config/opencode/agents/` to keep the main UI focused.
- Add a root architecture explainer so someone reviewing the configuration can quickly understand the operating model, trade-offs, and benefits.

## Capabilities

### New Capabilities
- `hybrid-agent-cell`: Defines a contract-first OpenCode agent architecture with a primary dispatcher, bounded A2A collaboration between specialized subagents, integrator-led convergence, and hybrid security controls.

### Modified Capabilities
- None.

## Impact

This affects OpenCode agent layout, subagent coordination rules, future prompt and permission design, acceptance-criteria enforcement, security review flow, and documentation for maintainers who need to understand why this architecture is used.
