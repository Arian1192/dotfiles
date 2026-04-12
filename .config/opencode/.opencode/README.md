# .opencode

This directory contains the active OpenCode-local command and skill assets.

## Purpose

- `command/` stores slash-dash commands such as `/opsx-apply`
- `skills/` stores OpenSpec-related skills
- `package.json` and `package-lock.json` pin dependencies used by these assets

## Why it stays separate

`.opencode/` behaves like an app-scoped extension area, so it is kept isolated from the top-level workspace files.

Do not remove or merge this directory just because some files look similar to `.pi/`; the command naming and packaging scope are different.
