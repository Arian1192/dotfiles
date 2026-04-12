# OpenCode workspace

This directory contains my local `~/.config/opencode` setup, stored in `dotfiles` as its own Stow package.

## What Stow does

GNU Stow creates symbolic links from this repository into `$HOME`.

Example:

- repo path: `opencode/.config/opencode/opencode.jsonc`
- linked path: `~/.config/opencode/opencode.jsonc`

From the root of the dotfiles repo:

```bash
stow opencode
```

## Structure

- `opencode.jsonc` — main OpenCode configuration
- `agents/` — specialist agent prompts
- `prompts/` — dispatcher prompt and primary prompt assets
- `openspec/` — OpenSpec specs and archived changes
- `.opencode/` — active OpenCode command/skill assets used by the app
- `.pi/` — compatibility/legacy prompt assets kept alongside `.opencode`

## Why there are two package.json files

There are two intentional manifests:

1. `package.json`
   - dependencies for the main workspace
2. `.opencode/package.json`
   - dependencies scoped to the embedded `.opencode` extension assets

Both are tracked on purpose.

## Notes about `.pi` and `.opencode`

- `.opencode/` uses the current slash-dash command style, like `/opsx-apply`
- `.pi/` keeps the slash-colon prompt variants, like `/opsx:apply`
- They overlap conceptually, but they are **not identical**, so they should not be merged blindly

For now the layout is intentionally conservative: documented and grouped, but not aggressively deduplicated until runtime behavior is fully verified.

## Local secrets

- `.env` is local-only and ignored by git
- `.env.example` is the template that is safe to commit
- `node_modules/` is ignored both at the root and inside `.opencode/`

## Recommended local bootstrap

```bash
cd ~/.dotfiles
stow opencode
cd ~/.config/opencode
cp .env.example .env
```

Then add your local secret values to `.env` and export them before starting OpenCode.
