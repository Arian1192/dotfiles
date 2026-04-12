# Engram + Caveman experiment

This branch tests two controlled changes to the OpenCode setup:

1. **Engram** as a persistent-memory MCP server
2. **Caveman-style terseness** only for low-risk subagent output

## What changed

### Engram

- Added an `engram` MCP server entry to `opencode.jsonc`
- Scope is intentionally limited to `--tools=agent`
- No auto-plugin install or automatic prompt takeover

### Terse subagent output

- Added a terse-output rule to `backend-implementer`
- Added a terse-output rule to `frontend-implementer`
- The rule is constrained so it does **not** compress:
  - Shared Contract sections
  - Coordination Message sections
  - validation failures
  - security warnings
  - acceptance criteria
  - final user-facing explanations

## Initial observations

- OpenCode accepted the MCP config once `engram` was declared as a `local` server with the full command array.
- `opencode mcp list` showed both `context7` and `engram` connected.
- Real dry runs used `engram_mem_search`, `engram_mem_context`, and `engram_mem_save` successfully.
- Specialist `implementation-status` and `validation-failure` messages stayed concise while preserving required structure.

## Safe acceptance gate

Acceptance criteria used for a conservative merge decision:

1. OpenCode starts and connects Engram without config errors.
2. Engram retrieves useful prior context when asked.
3. Engram can save one new durable memory and retrieve it immediately.
4. Terse implementer rules do not break `validation-failure` structure or clarity.
5. No clearly confusing or unsafe prompt behavior appears in controlled dry runs.

### Result

- **Criterion 1:** passed
- **Criterion 2:** passed
- **Criterion 3:** passed
- **Criterion 4:** passed
- **Criterion 5:** passed

### Recommendation

- **Engram:** safe enough to merge in its current MCP-only form.
- **Terse implementer output:** safe enough to merge with its current scope limits.
- **Still avoid** expanding terse mode into security, validation summaries, or final user-facing output until more production use confirms it.
