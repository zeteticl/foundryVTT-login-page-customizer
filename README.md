# Foundry VTT Login Page Customizer

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/zeteticl/foundryVTT-login-page-customizer/total)](https://github.com/zeteticl/foundryVTT-login-page-customizer/releases)
[![GitHub last commit](https://img.shields.io/github/last-commit/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer/commits/main)
[![GitHub stars](https://img.shields.io/github/stars/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer)

A cross-platform Node.js CLI that patches [Foundry Virtual Tabletop](https://foundryvtt.com/)'s login/setup page. Customize the join screen with video backgrounds, compact layout, custom logo, title styling, and more.

## Features

- **Active players only** — Show only active players in the user list
- **Video background** — Use video files as join/setup page backgrounds (with base-world patch)
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
- Foundry VTT installation (tested with v13.x; profile for v13.351 included)

## Installation

**Option A — Release (recommended)**  
Download the latest [Release](https://github.com/zeteticl/foundryVTT-login-page-customizer/releases) zip. Extract it; the archive has no `src` folder (patcher and `HTML/` are at the root). Run the patcher from that folder.

**Option B — Clone**

```bash
git clone https://github.com/zeteticl/foundryVTT-login-page-customizer.git
cd foundryVTT-login-page-customizer
```

No `npm install` is required — the patcher uses only Node.js built-in modules.

## Usage

### Windows (PowerShell or CMD)

If you use the **release zip**, run from the extracted folder:

```cmd
fvtt-login-patcher.cmd
```

If you **cloned the repo**, run from the `src` folder or:

```cmd
node src\fvtt-login-patcher.mjs
```

### Linux / macOS

If you use the **release zip**, from the extracted folder:

```bash
./fvtt-login-patcher.sh
```

If you **cloned the repo**:

```bash
./src/fvtt-login-patcher.sh
```

Or:

```bash
node src/fvtt-login-patcher.mjs
```

### Steps

1. **Target path** — Enter your Foundry app root (e.g. `C:\Program Files\Foundry Virtual Tabletop\resources\app` on Windows). Default is suggested if you've run the patcher before.
2. **Mode** — Choose **Modify** (backup + patch) or **Restore** (revert from backup).
3. **Options** — Answer the interactive prompts (yes/no and choices) for each feature.
4. **Apply** — Confirm to write changes. Modified files are listed at the end.

Backups are stored as `*.bak.orig` next to the patched files. Use **Restore** mode to revert.

## Version Support

The tool detects your Foundry version from `package.json` and uses a matching profile under `src/HTML/` (e.g. `v13.351`). If your build differs, you may need to add or adjust a profile (see `profile.json` and `snippets/` in that folder).

## Project Structure

```
src/
├── fvtt-login-patcher.mjs   # Main CLI script
├── fvtt-login-patcher.cmd   # Windows launcher
├── fvtt-login-patcher.sh    # Unix launcher
└── HTML/
    └── v13.351/             # Profile for Foundry v13.351
        ├── profile.json     # Paths, markers, snippet map
        └── snippets/        # Handlebars/JS snippets injected by the patcher
```

## Credits

- **xtlcme** — Original idea: [女神幻想論壇 — Foundry 登入頁自訂](https://www.goddessfantasy.net/bbs/index.php?topic=126755.0)

## Disclaimer

This tool modifies files inside your Foundry installation. Backups are created automatically; use **Restore** to undo. Updating Foundry may overwrite patched files — re-run the patcher after upgrading if you want to keep your customizations.
