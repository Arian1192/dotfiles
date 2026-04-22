## Why

The current Dispatcher prompt still implies it can "implement the task directly", which conflicts with the intended architecture: the Dispatcher should route and coordinate, not author implementation changes.

## What Changes

- Clarify the Dispatcher role so it can route work and coordinate specialists, but never implement code.
- Update the Dispatcher prompt to remove any language that suggests direct implementation.
- Align architecture documentation so the no-code boundary is explicit and easy to review.
- Preserve the existing single-agent vs parallel-work-cell decision model.

## Capabilities

### Modified Capabilities
- `hybrid-agent-cell`: Keep the routing model, but make the Dispatcher coordination-only and explicitly prohibit it from authoring implementation changes.

## Impact

- Affected systems: Dispatcher prompt, architecture docs, and OpenSpec guidance.
- Affected artifacts: `prompts/dispatcher.md`, `AGENT_ARCHITECTURE.md`, and the new change spec.
- Risks: confusing "single-agent path" with direct code edits if the boundary is not stated clearly.
