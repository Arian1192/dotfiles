# Dotfiles

My personal dotfiles repository, organized as **GNU Stow packages** so each area can be installed independently.

## Current layout

- `zsh/`
  - installs `~/.zshrc`
- `ghostty/`
  - installs `~/.config/ghostty/`
- `opencode/`
  - installs `~/.config/opencode/`
- `cursor/`
  - installs `~/Library/Application Support/Cursor/`

This package-based layout is more predictable than stowing the whole repo as a single unit.

## Requirements

On macOS:

```bash
brew install git stow
```

## Clone

```bash
git clone https://github.com/Arian1192/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
```

## Install with Stow

Install everything tracked here:

```bash
stow zsh ghostty opencode cursor
```

Or install only one package:

```bash
stow opencode
stow ghostty
stow zsh
```

If you ever want to remove a package's symlinks:

```bash
stow -D opencode
```

## Notes

- Documentation files like `README.md` are ignored by Stow and stay only in the repo.
- Secrets such as `.env` are intentionally not committed.
- The `opencode/` package contains its own README with setup notes and structure details.

## Practical examples

Install shell and terminal config only:

```bash
stow zsh ghostty
```

Install just the OpenCode workspace:

```bash
stow opencode
cd ~/.config/opencode
cp .env.example .env
```
