# Foundry VTT Login Page Customizer

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/zeteticl/foundryVTT-login-page-customizer/total)](https://github.com/zeteticl/foundryVTT-login-page-customizer/releases)
[![GitHub last commit](https://img.shields.io/github/last-commit/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer/commits/main)
[![GitHub stars](https://img.shields.io/github/stars/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer)

![Customized login page](image/login.png)

A cross-platform Node.js CLI that patches [Foundry Virtual Tabletop](https://foundryvtt.com/)'s login/setup page. Customize the join screen with video backgrounds, compact layout, custom logo, title styling, and more.

## Features

- **Active players only** — Show only active players in the user list
- **Video background** — Use video files as join/setup page backgrounds (with base-world patch). Supported formats: **MP4** (`.mp4`, `.m4v`), **WebM** (`.webm`), **Ogg** (`.ogv`). Playback depends on the browser’s HTML5 `<video>` support; MP4 (H.264) and WebM are widely supported.
- **Setup toggle** — Admin panel with collapse button `<` (angle bracket) to return to setup
- **Hide panels** — Optionally hide world description and game details panels
- **Single-row UI** — Compact, centered layout for the join form
- **Remove join heading** — Remove the "Join Game Session" heading
- **Main logo override** — Replace or remove the main logo via `--main-logo` CSS variable
- **Title glow** — Apply text-shadow styles with 8 built-in color palettes
- **Title font size** — Customize the title font size
- **Backup & restore** — Automatic backup before patching; restore mode to revert to original files

## Requirements

- **Node.js** (LTS recommended)
- Foundry VTT (tested v13.x; profile v13.351 included)

## Install & run

1. **Get the project** — [Download release zip](https://github.com/zeteticl/foundryVTT-login-page-customizer/releases) and extract, or `git clone` and `cd` into the repo. Both have the same layout (launchers at root, script in `src/`). No `npm install` needed.
2. **Run** from that folder:

   | Platform     | Command                  |
   | ------------ | ------------------------ |
   | Windows      | `fvtt-login-patcher.cmd` |
   | Linux/macOS  | `./fvtt-login-patcher.sh` |

   Linux/macOS: if **Permission denied**, run `chmod +x fvtt-login-patcher.sh` once, or use `node src/fvtt-login-patcher.mjs`.

3. **Follow prompts** — Choose Foundry app path, **Modify** or **Restore**, then options. Backups are `*.bak.orig`; use Restore to undo.

## Version support

The patcher reads Foundry version from `package.json` and uses a profile under `src/HTML/` (e.g. `v13.351`). For other builds, add or edit a profile in that folder.

## Project structure

```
src/
├── fvtt-login-patcher.mjs   # Main script
├── fvtt-login-patcher.cmd   # Windows launcher
├── fvtt-login-patcher.sh    # Unix launcher
└── HTML/v13.351/            # Profile (profile.json, snippets/)
```

## Credits

- **xtlcme** — Original idea: [女神幻想論壇 — Foundry 登入頁自訂](https://www.goddessfantasy.net/bbs/index.php?topic=126755.0)

## Disclaimer

This tool modifies files inside your Foundry installation. Backups are created automatically; use **Restore** to undo. Updating Foundry may overwrite patched files — re-run the patcher after upgrading if you want to keep your customizations.
