## Context

The Dispatcher now has a documented no-code boundary, but the operator still has to trust the prompt and downstream reviews rather than seeing a consistent visual confirmation in the Dispatcher's own output.

This change introduces a lightweight operator-facing marker: a standard routing record that appears whenever the Dispatcher classifies work and decides how it will be handled.

## Relationship to Existing Change

This change is a direct follow-up to `dispatcher-no-code-implementation`.

- `dispatcher-no-code-implementation` defines the behavioral boundary.
- `dispatcher-visual-routing-record` makes that boundary visible to the operator at runtime.

## Goals / Non-Goals

**Goals:**
- Give the operator a reliable visual signal that the Dispatcher is coordinating rather than implementing.
- Show who owns implementation work when implementation is actually needed.
- Keep the marker simple enough to use in normal responses without requiring new UI infrastructure.

**Non-Goals:**
- Building a full runtime observability panel.
- Adding new specialist roles.
- Replacing the broader A2A observability work proposed elsewhere.

## Decisions

### 1. Use a fixed textual routing record

The Dispatcher should emit this section whenever it makes an execution-path decision:

```md
## Dispatcher Routing Record
- Path: single-agent | parallel-work-cell
- Dispatcher Role: coordination-only
- Implementation Owner: <agent-name | none>
- Contract Version: <version | n/a>
- Reason:
```

### 2. Require the record on both paths

The record should appear whether the Dispatcher routes to a single owner or opens a parallel work cell, so the operator can confirm that the Dispatcher itself is not the implementer.

### 3. Keep the record adjacent to coordination summaries

The routing record should appear before or alongside coordination traces and final summaries so the operator can audit the handoff path quickly.

## Risks / Trade-offs

- A rigid output format may be skipped if prompts drift later.
- Some purely informational replies may not need a routing record; the prompt should scope it to execution-path decisions.
- The routing record is operator-visible proof, but it is still prompt/spec enforced rather than permission-enforced while Dispatcher edit permissions remain broader in config. This is acceptable for the current change because the goal is visibility and traceability, not permission hardening.

## Migration Plan

1. Update the Dispatcher prompt with the routing record requirement.
2. Update the canonical and change-local hybrid-agent-cell specs.
3. Update architecture docs to describe the visual marker.
4. Validate with a representative routed response shape.
