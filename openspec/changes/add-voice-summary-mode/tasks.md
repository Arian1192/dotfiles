## 1. Voice mode support in the plugin

- [x] 1.1 Extend the local voice config schema with an explicit `mode` field supporting `off`, `summary`, and `full`.
- [x] 1.2 Update the plugin to choose spoken content based on mode rather than always reading the full eligible response.
- [x] 1.3 Add spoken-summary extraction logic with a bounded fallback policy when the summary block is missing.

## 2. Assistant formatting for spoken summaries

- [x] 2.1 Add local prompt guidance so explanatory answers can include a dedicated spoken-summary block without replacing the full textual answer.
- [x] 2.2 Keep the spoken-summary format compact and easy for the plugin to parse reliably.

## 3. Local mode switching from OpenCode

- [x] 3.1 Add local OpenCode commands to switch the voice mode to `off`, `summary`, and `full`.
- [x] 3.2 Ensure those commands update the canonical local voice config file without touching unrelated settings.

## 4. Validation

- [x] 4.1 Validate `off` mode keeps audio fully disabled.
- [x] 4.2 Validate `summary` mode preserves full text while speaking only the summary block.
- [x] 4.3 Validate `full` mode preserves full text while speaking the whole eligible response.
