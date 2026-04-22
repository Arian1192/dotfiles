## Why

The `dispatcher-no-code-implementation` change made the Dispatcher's coordination-only boundary explicit, but operators still do not get a guaranteed visual marker in live responses that proves the Dispatcher stayed on the routing side of the boundary.

This follow-up change builds on `dispatcher-no-code-implementation` by making the Dispatcher's routing decision and non-implementation role visible in its output.

## What Changes

- Require the Dispatcher to emit a standard visual routing record whenever it makes an execution-path decision.
- Show the selected path, the Dispatcher's coordination-only role, the implementation owner, and the applicable contract version.
- Preserve compatibility with both the single-agent path and the parallel work-cell path.
- Align the prompt, architecture docs, and canonical spec so the visual marker is part of the documented workflow.

## Capabilities

### Modified Capabilities
- `hybrid-agent-cell`: Extend Dispatcher routing so its coordination-only role is visible through a standard operator-facing routing record.

## Impact

- Affected systems: Dispatcher prompt behavior, architecture traceability guidance, and the hybrid-agent-cell spec.
- Affected artifacts: `prompts/dispatcher.md`, `AGENT_ARCHITECTURE.md`, `openspec/specs/hybrid-agent-cell/spec.md`, and this change set.
- Risks: over-prescribing output formatting if the record is too rigid; confusing non-implementation informational replies with routed execution unless the record is scoped clearly.
