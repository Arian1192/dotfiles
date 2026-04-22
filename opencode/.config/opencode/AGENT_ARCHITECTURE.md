# Agent Architecture

## Summary

This OpenCode setup uses a contract-first hybrid agent architecture.

The short version is:

- simple tasks stay on a cheap single-agent path
- the dispatcher remains coordination-only and never authors implementation changes
- multi-surface tasks can fan out to specialist subagents
- subagents can coordinate through bounded A2A messages
- an integrator checks convergence against a shared contract and acceptance criteria
- security participates twice: before implementation as an advisor and after integration as a gatekeeper

This pattern is meant to balance three competing goals:

- keep cost under control
- support real engineering tasks that span backend, frontend, and security
- avoid the chaos of an always-on multi-agent mesh

## Why this architecture exists

There are three common patterns people reach for when building agent systems for coding work:

1. A single powerful agent that does everything
2. A fully connected multi-agent system where specialists constantly collaborate
3. A controlled hybrid that uses specialists only when the task actually needs them

This configuration chooses the third option.

The reason is simple:

- a single agent is cheap and easy to run, but it struggles when work spans multiple domains
- a full multi-agent mesh can coordinate deeply, but it is expensive, noisy, and hard to debug
- a controlled hybrid keeps the common path simple while still allowing real collaboration on tasks like auth flows, cross-cutting refactors, or frontend-backend integrations

## Core pattern

The system is organized around these roles:

- `dispatcher`: primary routing authority and coordination-only entry point
- `contract-planner`: defines the shared contract before parallel work begins
- `backend-implementer`: owns backend implementation work
- `frontend-implementer`: owns frontend implementation work
- `security-advisor`: reviews sensitive design choices early and gates risky output later
- `integrator`: checks whether all partial outputs satisfy the shared contract and acceptance criteria
- `reviewer`: optional final critic for risky or complex changes

## Execution flow

```text
User request
  -> Dispatcher
  -> Execution decision
     -> Single-agent path (routing/coordination only; no Dispatcher-authored implementation)
     -> Parallel work cell
          -> Contract Planner
           -> Backend Implementer
           -> Frontend Implementer
           -> Security Advisor (when needed)
           <-> bounded A2A over shared contract
  -> Integrator
  -> Validation
  -> Security Gate
  -> Reviewer (selective)
  -> Final output
```

## Why contract-first matters

Parallel implementation only works if everyone is building against the same target.

For example, an auth task needs agreement on:

- login and logout flow
- refresh behavior
- cookie or token strategy
- request and response payloads
- error states
- redirects
- acceptance criteria

If backend and frontend start in parallel without that contract, they often drift and create rework.

That is why this architecture requires a shared contract before specialist implementation starts.

## Why bounded A2A is used

Subagents are allowed to coordinate logically. That is intentional.

They are not meant to work as isolated silos.

But this system does not use an unrestricted mesh where every agent can talk freely forever. Instead, it uses bounded A2A coordination tied to a shared contract version.

That means agent-to-agent messages should focus on:

- dependency requests
- blocker reporting
- contract change proposals
- implementation status
- compatibility confirmation

This gives real collaboration without paying the cost of uncontrolled coordination.

## Why the integrator has authority

The integrator is not just a merger.

It is the convergence authority for the work cell.

Its job is to compare partial work against:

- the active contract version
- the acceptance criteria
- validation results

If the implementation does not converge, the integrator can return work to the responsible subagent.

This matters because many failures do not show up inside a single specialist. They appear when two correct-looking partial implementations do not actually fit together.

## Why security is hybrid

Security is used in two places on purpose.

Before implementation:

- review auth and permission design
- challenge unsafe storage choices
- catch trust-boundary mistakes early

After integration:

- gate risky output
- block insecure auth or authorization behavior
- ensure sensitive changes do not ship without meeting minimum standards

This is especially important for tasks involving:

- authentication
- authorization
- secrets
- session boundaries
- external integrations

## Why agents are split across config locations

This repository keeps agents in two places for clarity.

Primary agents live in:

- `~/.config/opencode/opencode.jsonc`

Specialist subagents live in:

- `~/.config/opencode/agents/`

This split is important because otherwise every specialist could appear as a top-level agent in the interface, which makes the setup noisy and harder to reason about.

The intended outcome is:

- a small, stable set of user-facing primary agents
- a larger, organized pool of specialist subagents behind them

For internal-only specialists, `mode: subagent` and `hidden: true` should be used when supported so the UI stays focused.

## Configuration map

The current layout is intentionally split like this:

- `~/.config/opencode/opencode.jsonc`
  - user-facing primary agents
  - currently includes `dispatcher`
- `~/.config/opencode/prompts/dispatcher.md`
  - routing policy for single-agent vs parallel-work-cell execution
- `~/.config/opencode/agents/contract-planner.md`
  - defines the shared contract
- `~/.config/opencode/agents/backend-implementer.md`
  - backend specialist
- `~/.config/opencode/agents/frontend-implementer.md`
  - frontend specialist
- `~/.config/opencode/agents/security-advisor.md`
  - early advisor and late gatekeeper
- `~/.config/opencode/agents/integrator.md`
  - convergence authority with rework power
- `~/.config/opencode/agents/reviewer.md`
  - selective final reviewer

This map is the fastest way to understand where behavior lives.

The Dispatcher is intentionally not an implementation agent. Its responsibility is to classify work, decide whether a work cell is needed, and coordinate the right specialists or validation path. If implementation is required, that work belongs to the appropriate specialist, not to the Dispatcher.

## Context7 integration

This workspace uses a shared `context7` MCP server in `~/.config/opencode/opencode.jsonc` so agents and subagents can retrieve current third-party library and framework documentation when they actually need it.

The intended rule is simple:

- use Context7 for external library APIs, setup steps, configuration details, and version-sensitive behavior
- do not use Context7 for repository-local edits that can be completed from the checked-out workspace
- if Context7 is unavailable, continue with local context and call out the limitation when it materially affects confidence

## Context7 API key setup

This repository is safe to publish because the config reads the key from an environment variable instead of hardcoding it.

The OpenCode config uses:

```jsonc
"headers": {
  "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}"
}
```

Recommended local setup:

1. Copy `.env.example` to `.env`
2. Put your real `CONTEXT7_API_KEY` in `.env`
3. Export it into your shell before starting OpenCode, for example:

```bash
set -a
source .env
set +a
opencode
```

Because the config is using `{env:CONTEXT7_API_KEY}`, the secret stays local and does not need to be committed to GitHub.

## Shared contract shape

Every parallel task is expected to converge on this shape:

```md
## Shared Contract v<version>
- Goal:
- Active Path: single-agent | parallel-work-cell
- Owners:
- Interfaces:
- Acceptance Criteria:
- Validation Plan:
- Security Notes:
- Open Risks:
```

This is the anchor that keeps backend, frontend, integrator, and security aligned.

## Bounded A2A shape

Specialists are allowed to coordinate, but only through bounded, structured messages.

```md
## Coordination Message
- Type: propose-contract-change | request-dependency | declare-blocker | implementation-status | validation-failure | handoff-note
- From:
- To:
- Contract Version:
- Affected Artifacts:
- Requested Action:
- Reason:
```

This is how agents "talk to each other" logically without becoming an uncontrolled swarm.

## Traceability shape

To keep rework and acceptance decisions explainable, the system should preserve outcomes in a form close to this:

```md
## Integration Outcome
- Contract Version:
- Status: accepted | rework-required | blocked
- Acceptance Criteria Result:
- Validation Result:
- Security Result:
- Rework Owner:
- Reason:
```

That record is the minimum useful audit trail for understanding why a change moved forward, got blocked, or was sent back.

For operator-visible proof that the Dispatcher stayed on the coordination side of the boundary, routed execution should also emit a routing marker like this:

```md
## Dispatcher Routing Record
- Path: single-agent | parallel-work-cell
- Dispatcher Role: coordination-only
- Implementation Owner: <agent-name | none>
- Contract Version: <version | n/a>
- Reason:
```

This is the fastest visual check that the Dispatcher selected a path and handed implementation to the correct owner instead of doing the implementation itself.

For security-sensitive changes, the gate can be summarized like this:

```md
## Security Gate Result
- Contract Version:
- Status: approved | blocked
- Concern:
- Required Fix:
```

## How bounded A2A is enforced

Bounded A2A is not only a prompt convention. It is also reflected in agent permissions.

- `dispatcher` can invoke only the specialist subagents that belong to this work cell
- specialists are hidden from the main UI to reduce noise
- specialists can invoke only selected peers through `permission.task`
- no agent is configured with unrestricted task fan-out

That means collaboration is real, but the graph stays constrained.

## Routing examples

Examples that should stay on the cheap single-agent path:

- route one backend validation change to the backend owner without opening a work cell
- route one frontend component prop change within a local surface without opening a work cell
- handle a small documentation or prompt clarification that does not require specialist implementation

Examples that should enter the parallel work cell:

- auth flow touching backend session logic and frontend login UI
- API schema change that requires coordinated server and client updates
- permission-sensitive work that needs backend, frontend, and security alignment

Those examples are useful as a quick sanity check when reviewing the configuration.

## Benefits

- Lower default cost because simple work avoids the multi-agent path
- Better support for cross-domain engineering tasks
- Clear ownership boundaries between specialists
- Real collaboration without full-mesh complexity
- Stronger convergence through integrator rework authority
- Better security posture on sensitive changes
- Cleaner OpenCode UI and configuration structure
- Easier onboarding for maintainers who need to understand the system quickly

## Trade-offs

- The contract step adds some upfront overhead
- A2A coordination still costs something if overused
- The integrator can become a bottleneck if it is made too broad
- Security involvement can slow low-risk work if triggers are too loose

These trade-offs are acceptable because they are controlled and intentional. The architecture is designed to spend more only when the task complexity justifies it.

## Good fit

This architecture is a good fit for:

- auth flows that span backend and frontend
- API plus UI changes with shared schemas
- permission or policy-sensitive work
- changes where integration failures are likely
- codebases where maintainability and explainability matter

## Bad fit

This architecture is a bad fit for:

- tiny single-file edits
- trivial documentation updates
- work that does not cross ownership boundaries
- teams that want an always-on swarm regardless of cost

## Rule of thumb

Use the simple path by default.

Only open the parallel work cell when the task has clear specialist boundaries and a shared contract that makes parallelism worth the cost. In all cases, keep the Dispatcher on the routing/coordination side of the boundary rather than letting it implement product changes.

In one sentence:

this system is designed to be simple by default, parallel when useful, collaborative without chaos, and strict at integration boundaries.
