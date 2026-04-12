## 1. Primary agent layout

- [x] 1.1 Add the `dispatcher` primary agent to `~/.config/opencode/opencode.jsonc` and document its routing responsibility.
- [x] 1.2 Confirm that only intended primary agents remain top-level and that specialist agents are not exposed as primary UI entries.

## 2. Specialist subagents

- [x] 2.1 Create subagent definitions in `~/.config/opencode/agents/` for `contract-planner`, `backend-implementer`, `frontend-implementer`, `security-advisor`, `integrator`, and `reviewer`.
- [x] 2.2 Configure each subagent with role-specific descriptions, prompts, permissions, and `mode: subagent`.
- [x] 2.3 Mark internal-only specialist subagents with `hidden: true` where they should not appear in the `@` autocomplete menu.

## 3. Contract-first coordination

- [x] 3.1 Implement dispatcher logic that chooses between the single-agent path and the parallel work-cell path.
- [x] 3.2 Define the shared contract structure so it captures ownership boundaries, interface expectations, contract version, and acceptance criteria.
- [x] 3.3 Implement bounded A2A coordination messages for contract updates, blockers, dependency requests, and implementation status.

## 4. Integration and security gates

- [x] 4.1 Implement integrator checks against the shared contract, acceptance criteria, and validation results.
- [x] 4.2 Allow the integrator to reject non-conforming partial work and return rework instructions to the responsible subagent.
- [x] 4.3 Implement hybrid security participation so security advises during contract design for sensitive tasks and gates final delivery after integration.

## 5. Validation and explainability

- [x] 5.1 Record traceable contract versions, coordination decisions, integration outcomes, and security gate results.
- [x] 5.2 Verify that simple tasks stay on the cheap single-agent path while backend/frontend tasks can use the parallel work cell.
- [x] 5.3 Add or update maintainer-facing documentation so the architecture and configuration layout are easy to understand at a glance.
