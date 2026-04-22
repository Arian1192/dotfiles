## Representative Validation

This validation artifact persists a representative routed response shape so operators and reviewers can confirm the visual marker required by this change.

### Example: single-agent path routed to one owner

```md
## Dispatcher Routing Record
- Path: single-agent
- Dispatcher Role: coordination-only
- Implementation Owner: backend-implementer
- Contract Version: n/a
- Reason: The request stays within one backend-owned surface and does not require cross-domain coordination.
```

Validation result:
- `Path` present
- `Dispatcher Role: coordination-only` present
- `Implementation Owner` present and not `dispatcher`
- `Contract Version` present
- `Reason` present

### Example: parallel work-cell path

```md
## Dispatcher Routing Record
- Path: parallel-work-cell
- Dispatcher Role: coordination-only
- Implementation Owner: backend-implementer, frontend-implementer
- Contract Version: v1
- Reason: The request changes backend and frontend behavior and needs a shared contract before implementation.
```

Validation result:
- `Path` present
- `Dispatcher Role: coordination-only` present
- `Implementation Owner` present and does not include `dispatcher`
- `Contract Version` present
- `Reason` present

## Preserved Integration Outcome

```md
## Integration Outcome
- Contract Version: n/a (spec/documentation change reviewed against active change `dispatcher-visual-routing-record` and canonical `hybrid-agent-cell`)
- Status: accepted
- Acceptance Criteria Result: Passed. The change is correctly positioned as a follow-up to `dispatcher-no-code-implementation` in both proposal and design; the visual routing-record requirement is reflected consistently in `prompts/dispatcher.md`, `AGENT_ARCHITECTURE.md`, the canonical spec, and the change-local spec; and the completed tasks align with the implemented artifact set.
- Validation Result: Passed with static evidence. The prompt contains `## Dispatcher Routing Record` and the required fields (`Path`, `Dispatcher Role`, `Implementation Owner`, `Contract Version`, `Reason`); the architecture doc carries the same template; the canonical spec includes the new routing-record requirement and scenario; the local spec mirrors that canonical requirement. No conflicting wording was found.
- Security Result: Not applicable. This change is prompt/spec/doc traceability work and does not introduce auth, authorization, secrets, or session-boundary behavior.
- Rework Owner: none
- Reason: The implemented change cleanly extends the earlier no-code boundary work rather than redefining it: `dispatcher-no-code-implementation` established that the Dispatcher must not implement, and `dispatcher-visual-routing-record` makes that boundary operator-visible. The artifacts are internally consistent, and the task list matches what was actually changed.
```
