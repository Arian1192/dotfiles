---
description: Enable spoken summary mode by updating the local voice config and verifying the change
---

Enable spoken summary mode.

Run `node ./plugins/set-voice-mode.mjs summary` from the repository root to update the canonical local config file at `plugins/voice-output.config.json`.

Requirements:
- Update the real config file, not just describe the change.
- Preserve all unrelated settings exactly as they are.
- Keep the mode as `summary` and the matching enabled state after the update.
- Read `plugins/voice-output.config.json` after running the script and confirm the active mode.

After that, reply briefly that spoken summary mode is active: full text stays visible, and when a response contains `## Resumen hablado`, only that summary should be spoken; otherwise the full eligible response is spoken.
