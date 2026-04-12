## Why

Agents in this OpenCode setup currently rely on their built-in knowledge, local repository context, and generic web lookups, which increases the chance of stale library guidance or hallucinated APIs during implementation work. Adding Context7 now gives agents and subagents a consistent way to pull current, version-aware library documentation only when a task actually depends on external package or framework behavior.

## What Changes

- Add a new agent capability for Context7-backed library and API documentation retrieval.
- Define when primary agents and specialist subagents should use Context7, especially for library APIs, setup steps, and configuration questions.
- Standardize a shared OpenCode-level Context7 integration so eligible agents can use the same documentation source without duplicate per-agent setup.
- Define fallback behavior when Context7 is unavailable so work can continue without blocking the task.
- Document safe configuration expectations so maintainers do not need to commit Context7 secrets into tracked files.

## Capabilities

### New Capabilities
- `agent-context7-docs`: Defines optional, shared Context7 access for OpenCode agents and subagents, including selective usage rules, configuration expectations, and fallback behavior when documentation augmentation is unavailable.

### Modified Capabilities
- None.

## Impact

This affects OpenCode configuration in `opencode.jsonc`, agent and subagent instructions under `prompts/` and `agents/`, maintainer documentation for local setup, and future implementation tasks that depend on accurate third-party library or framework documentation.
