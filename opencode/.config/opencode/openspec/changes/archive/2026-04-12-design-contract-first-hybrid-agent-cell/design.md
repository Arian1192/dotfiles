## Context

OpenCode currently has an empty custom agent configuration and no existing architecture spec in this workspace. The goal of this change is to define a durable architecture for future agent configuration that can handle both simple coding requests and cross-domain work such as authentication flows that span backend, frontend, and security concerns.

The key tension is between cost and coordination quality. A single agent is cheap and easy to operate, but it becomes strained when work spans multiple implementation surfaces. A fully connected multi-agent mesh improves collaboration but adds persistent routing cost, conversational noise, and hard-to-debug conflicts. This design chooses a middle path: a contract-first hybrid cell with bounded collaboration and explicit convergence authority.

## Goals / Non-Goals

**Goals:**
- Keep the default path simple and inexpensive for straightforward coding work.
- Support parallel implementation when a task crosses clear ownership boundaries such as backend and frontend.
- Allow subagents to coordinate logically through A2A without devolving into an unbounded mesh.
- Give the integrator authority to return work when acceptance criteria are not met.
- Use security as both an early design advisor and a final gate for sensitive changes.
- Preserve a clean OpenCode interface by keeping primary agents in `opencode.jsonc` and specialist subagents in `agents/`.
- Make the architecture understandable to maintainers through explicit documentation.

**Non-Goals:**
- Build a swarm-style architecture where any agent can freely delegate to any other agent at any time.
- Introduce always-on review or always-on security for every low-risk request.
- Fully specify the wire format of an external A2A protocol implementation in this change.
- Replace human judgment for destructive or privileged actions.

## Decisions

- Use a primary `dispatcher` as the routing authority.
  Rationale: a primary agent makes execution mode selection explicit and keeps task entry simple for the user.
  Alternative considered: a model-driven coordinator shared across all agents. Rejected because it would introduce constant orchestration cost even for simple tasks.

- Make the architecture contract-first.
  Rationale: backend and frontend parallelism only works reliably after the task has a stable shared contract, ownership boundaries, and acceptance criteria.
  Alternative considered: parallelize immediately and reconcile differences later. Rejected because it creates rework and ambiguous ownership.

- Use bounded A2A instead of a free-form mesh.
  Rationale: specialists need real coordination, but that coordination should stay focused on blockers, dependencies, and contract changes tied to a known contract version.
  Alternative considered: prohibit peer communication and force all exchanges through the dispatcher. Rejected because it makes collaboration too slow and indirect for implementation work.

- Give the integrator rework authority.
  Rationale: integration is where architectural mismatches surface. The integrator must be able to reject outputs that do not satisfy the shared contract or acceptance criteria.
  Alternative considered: use the integrator only as a merge step. Rejected because it would allow invalid work to drift downstream.

- Split the security role into advisor-before and gatekeeper-after.
  Rationale: for auth and permission work, security needs early influence on design choices and late authority on release readiness.
  Alternative considered: run security only at the end. Rejected because late discovery of insecure contract decisions is expensive.

- Separate primary agents from specialist subagents in OpenCode configuration.
  Rationale: the user experience stays clean when only a small set of primary agents appear directly, while specialists live in `~/.config/opencode/agents/` and can be hidden from autocomplete when appropriate.
  Alternative considered: define every agent at the top level. Rejected because it clutters the interface and weakens mental separation between user-facing agents and internal workers.

## Risks / Trade-offs

- [Risk] Contract definition may become too heavyweight for medium-complexity tasks -> Mitigation: keep the dispatcher able to select a single-agent path when cross-domain coordination is unnecessary.
- [Risk] Bounded A2A can still add cost if too many contract revisions are allowed -> Mitigation: version contracts explicitly and cap rework loops.
- [Risk] The integrator can become a bottleneck if it takes on too much reasoning -> Mitigation: restrict it to convergence, acceptance-criteria checks, and concrete rework decisions.
- [Risk] Early security involvement can slow low-risk work -> Mitigation: require hybrid security participation only for sensitive domains such as auth, authorization, secrets, and session boundaries.
- [Risk] Hidden subagents can become opaque to maintainers -> Mitigation: document the architecture at the repository root and keep each subagent file self-describing.

## Migration Plan

1. Add the architecture change and root documentation first so the intent is reviewable before implementation.
2. Introduce the `dispatcher` as a primary agent in `~/.config/opencode/opencode.jsonc`.
3. Create specialist subagents in `~/.config/opencode/agents/` with descriptions, prompts, and permissions aligned to their roles.
4. Configure internal-only specialists with `mode: subagent` and `hidden: true` where appropriate.
5. Implement the contract-first workflow and integrator/security checkpoints.
6. Validate that simple requests stay on the cheap path and that cross-domain requests can enter the parallel work cell.
7. Tune escalation, review, and security gates based on observed rework and coordination overhead.

## Open Questions

- Which exact tasks should force the parallel work-cell path instead of letting the dispatcher choose opportunistically?
- How many contract revisions and integrator rework loops should be allowed before the system escalates to human review?
- Which specialist subagents should remain user-visible versus internal-only by default?
