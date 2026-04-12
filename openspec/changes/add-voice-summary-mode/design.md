## Context

The current VoxCPM experiment can synthesize and play a full assistant reply after text generation. That proves the audio path, but long-form playback feels less natural than short spoken snippets. The desired behavior is “text-first plus spoken summary,” with the ability to turn audio off, speak only a summary, or speak the full answer.

The existing plugin already owns post-response synthesis and playback, so the safest extension is to add mode-aware selection of what gets spoken rather than rebuilding the response lifecycle. The main design challenge is deciding where the spoken summary comes from and how the user flips modes inside OpenCode.

## Goals / Non-Goals

**Goals:**
- Add `off`, `summary`, and `full` voice modes.
- Preserve full text output in all modes.
- Speak only a concise summary in `summary` mode.
- Let the user switch modes from OpenCode without editing JSON by hand.
- Keep existing fallback behavior: text still succeeds if summary extraction or audio fails.

**Non-Goals:**
- Building a general preferences UI.
- Streaming partial summaries while the model is still answering.
- Adding cloud storage for local voice profiles.
- Rewriting the main assistant style for every prompt in the repository.

## Decisions

### 1. Add explicit voice modes in plugin config
- Decision: Extend the plugin config with `mode: off | summary | full`.
- Why: This expresses the user intent directly and keeps the plugin behavior deterministic.
- Alternative considered: Deriving mode from multiple booleans. Rejected because it is harder to reason about and toggle safely.

### 2. Use response markers for spoken summaries
- Decision: In `summary` mode, the plugin will look for a dedicated spoken-summary block in the assistant output and speak only that block.
- Why: A model-authored summary is more useful than blindly truncating text, and the parsing remains local/simple.
- Alternative considered: Auto-summarizing inside the plugin. Rejected because it would require a second model call or crude heuristics.

### 3. Preserve full text and hide summary duplication from playback selection only
- Decision: The full response remains visible to the user, and the plugin only changes what audio is synthesized.
- Why: Text is the source of truth; audio is a convenience layer.
- Alternative considered: Replacing the final response body with just the summary. Rejected because it throws away useful detail.

### 4. Add local OpenCode commands to switch modes
- Decision: Add small local commands such as `/voice-off`, `/voice-summary`, and `/voice-full` that update the local plugin config file.
- Why: This satisfies the “disconnectable through OpenCode” requirement without needing core product changes.
- Alternative considered: Editing config manually. Rejected because it is too clunky for everyday use.

### 5. Keep Fer Miralles as the preferred local profile, but outside committed defaults
- Decision: Treat the Fer profile as the active local preference, not a committed shared default.
- Why: The repository should not force a machine-specific voice profile on other setups.
- Alternative considered: Hard-coding Fer into shared config. Rejected because it is personal/local state.

## Risks / Trade-offs

- [Risk] The model may forget to include a spoken-summary block. → Mitigation: the plugin falls back to the full eligible text or skips audio according to mode policy.
- [Risk] Summary text could still be too long. → Mitigation: add a max-length cap for spoken-summary extraction.
- [Risk] Mode-switch commands may drift from config schema. → Mitigation: have commands update one canonical JSON config file.
- [Risk] Summary markers may show extra formatting in normal reading. → Mitigation: keep the block compact and clearly labeled.

## Migration Plan

1. Extend the local plugin config with `mode` and summary extraction settings.
2. Update the voice plugin to select spoken text based on mode.
3. Add prompt instructions so explanatory answers include a spoken-summary block when appropriate.
4. Add local OpenCode commands for `off`, `summary`, and `full`.
5. Validate all three modes with the Fer local profile.

## Open Questions

- Should `summary` be the local default once the flow feels good, or stay opt-in?
- Should the spoken-summary marker be English (`## Spoken Summary`) or Spanish (`## Resumen hablado`) in the final UX?
- In `summary` mode, should the plugin fall back to full text if the marker is missing, or stay silent?
