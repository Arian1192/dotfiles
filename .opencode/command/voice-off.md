---
description: Disable voice output by updating the local voice config and verifying the change
---

Disable voice output mode.

Run `node ./plugins/set-voice-mode.mjs off` from the repository root to update the canonical local config file at `plugins/voice-output.config.json`.

Requirements:
- Update the real config file, not just describe the change.
- Preserve all unrelated settings exactly as they are.
- Keep the mode as `off` and the matching enabled state after the update.
- Read `plugins/voice-output.config.json` after running the script and confirm the active mode.

After that, reply briefly that voice output is disabled and future responses should remain text-only with no synthesis or playback.
