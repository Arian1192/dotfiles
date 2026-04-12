## 1. Shared Context7 configuration

- [x] 1.1 Add a shared Context7 MCP configuration entry to `opencode.jsonc` using the remote Context7 server URL.
- [x] 1.2 Ensure the configuration does not require any committed API secret and document any optional local-only authentication path.

## 2. Agent and subagent guidance

- [x] 2.1 Update the dispatcher prompt so it knows when Context7 should be used for library, API, setup, and configuration questions.
- [x] 2.2 Update relevant specialist subagent prompts so they use Context7 selectively for external documentation and skip it for repository-local work.
- [x] 2.3 Add fallback guidance so agents continue working and disclose limitations when Context7 is unavailable.

## 3. Maintainer documentation

- [x] 3.1 Add maintainer-facing setup notes that explain the Context7 integration choice and optional local authentication or API key setup.
- [x] 3.2 Document the intended usage rule: use Context7 when current third-party docs matter, not for purely local changes.

## 4. Validation

- [x] 4.1 Verify the OpenCode configuration remains valid after adding the Context7 integration.
- [x] 4.2 Validate that an agent can use Context7 for an external library question and skip it for a local-only task.
- [x] 4.3 Validate fallback behavior when Context7 is unavailable or not configured with elevated credentials.
