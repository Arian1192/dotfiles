## Context

This OpenCode workspace already has a contract-first multi-agent architecture, but it does not yet provide a standardized documentation augmentation path for third-party libraries or frameworks. Agents currently rely on model knowledge, repository context, and ad hoc web fetching, which is sufficient for some tasks but weaker when implementation depends on current library APIs, framework configuration, or version-specific setup details.

Context7 offers two relevant integration styles: CLI + skills and MCP. OpenCode already has first-class MCP configuration support in `opencode.jsonc`, including remote MCP servers, headers, OAuth settings, and timeouts. That makes MCP the most direct shared integration path for this workspace because it can be configured once and exposed consistently to the agents that need it.

## Goals / Non-Goals

**Goals:**
- Give agents and subagents access to up-to-date library and framework documentation when a task depends on external APIs or setup guidance.
- Keep Context7 usage selective so agents do not pay unnecessary retrieval cost on purely local or repository-only tasks.
- Prefer one shared OpenCode-level integration over duplicated per-agent setup.
- Avoid requiring committed secrets in tracked configuration.
- Define graceful fallback behavior so work can continue if Context7 is unavailable.

**Non-Goals:**
- Build a custom documentation proxy or wrapper around Context7.
- Require Context7 for every task or every answer.
- Guarantee perfect external documentation quality for every supported library.
- Introduce a separate documentation specialist agent in this change.

## Decisions

- Use a shared OpenCode MCP integration as the primary Context7 setup path.
  Rationale: OpenCode already supports remote MCP servers in `opencode.jsonc`, so one workspace-level MCP entry is the clearest way to make Context7 available to primary agents and subagents without layering extra per-agent bootstrap logic.
  Alternative considered: install Context7 through CLI + skills with `npx ctx7 setup --opencode`. Rejected as the primary design because it is more implicit, less reviewable in-repo, and harder to standardize across all agents, though it remains a useful manual fallback for maintainers.

- Make Context7 opt-in by task type rather than always-on.
  Rationale: the user request is to add Context7 for the agents that need it, not to force every task through an external documentation lookup. Selective use preserves cost and latency on straightforward repository-local work.
  Alternative considered: always consult Context7 before implementation. Rejected because it would slow common tasks and over-expand external context.

- Trigger Context7 primarily for library APIs, framework configuration, setup steps, and version-sensitive integration work.
  Rationale: these are the cases where model knowledge goes stale fastest and where version-aware documentation most improves implementation quality.
  Alternative considered: limit Context7 to explicit user requests only. Rejected because agents should be able to use it proactively when the task clearly depends on external docs.

- Keep API key usage optional and out of tracked configuration.
  Rationale: Context7 recommends an API key for higher rate limits, but the integration should not require committing secrets into `opencode.jsonc`. The baseline config can work without a checked-in key, with local secret injection or interactive auth documented separately if needed.
  Alternative considered: hardcode a Context7 API key header in tracked config. Rejected for obvious secret-handling reasons.

- Require graceful fallback when Context7 is unavailable.
  Rationale: documentation augmentation should improve agent quality, not become a new hard dependency that blocks work. If the tool is unavailable, the agent should continue with local context and clearly state the limitation.
  Alternative considered: fail the task whenever Context7 cannot be reached. Rejected because it would make the system brittle.

## Risks / Trade-offs

- [Risk] Agents may overuse Context7 for tasks that only need repository context -> Mitigation: update prompts to limit Context7 to library/API/setup/configuration work.
- [Risk] A shared MCP integration could expose a tool to agents that rarely need it -> Mitigation: rely on prompt guidance and task classification rather than creating duplicate agent-specific configs.
- [Risk] Remote docs may still be incomplete or misleading for some libraries -> Mitigation: require agents to treat Context7 as an augmentation source and cross-check against local code when integration details matter.
- [Risk] Missing API keys may lead to rate limits or slower retrieval -> Mitigation: keep the key optional, document local setup, and ensure fallback behavior remains acceptable.
- [Risk] Introducing external docs lookup can blur traceability of where guidance came from -> Mitigation: instruct agents to mention Context7 usage when it materially informed the answer or implementation.

## Migration Plan

1. Add the new OpenSpec capability and implementation tasks for Context7-backed documentation access.
2. Add a shared Context7 MCP entry to `opencode.jsonc` using the remote server URL.
3. Update the dispatcher and relevant specialist prompts so they know when to use Context7 and when not to.
4. Document optional local authentication or API key configuration without committing secrets.
5. Validate that agents use Context7 for external library questions and skip it for repository-local tasks.
6. Validate that work continues with a clear fallback path when Context7 is unavailable.

## Open Questions

- Should Context7 be available to every subagent by default, or only to implementation-oriented roles?
- Where should maintainer-facing setup notes live long term: `AGENT_ARCHITECTURE.md`, a dedicated setup document, or both?
- Do we want a future validation step that checks whether the MCP server is reachable before enabling the integration by default?
