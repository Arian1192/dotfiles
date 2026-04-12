---
description: Enable full voice mode by updating the local voice config and verifying the change
---

Enable full voice mode.

Run `node ./plugins/set-voice-mode.mjs full` from the repository root to update the canonical local config file at `plugins/voice-output.config.json`.

Requirements:
- Update the real config file, not just describe the change.
- Preserve all unrelated settings exactly as they are.
- Keep the mode as `full` and the matching enabled state after the update.
- Read `plugins/voice-output.config.json` after running the script and confirm the active mode.

After that, reply briefly that full voice mode is active: the full eligible response text should be spoken while the full text remains visible on screen.
