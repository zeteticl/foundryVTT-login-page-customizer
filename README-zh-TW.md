# Foundry VTT Login Page Customizer（登入頁自訂工具）

[![GitHub 版本](https://img.shields.io/github/v/release/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer/releases)
[![GitHub 下載次數](https://img.shields.io/github/downloads/zeteticl/foundryVTT-login-page-customizer/total)](https://github.com/zeteticl/foundryVTT-login-page-customizer/releases)
[![最後提交](https://img.shields.io/github/last-commit/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer/commits/main)
[![GitHub 星數](https://img.shields.io/github/stars/zeteticl/foundryVTT-login-page-customizer)](https://github.com/zeteticl/foundryVTT-login-page-customizer)
[![Patreon 贊助](https://img.shields.io/badge/Patreon-贊助-F96854?logo=patreon)](https://www.patreon.com/HKTRPG)

![Customized login page](image/login.png)

一個跨平台的 Node.js 命令列工具，用來修改 [Foundry Virtual Tabletop](https://foundryvtt.com/) 的登入／設定畫面。你可以自訂登入頁的影片背景、版面配置、主 Logo、標題發光效果與字級等。

如果你喜歡這個專案，可以 [請我喝杯茶 ☕](https://www.patreon.com/HKTRPG)。

## 功能

- **隱藏 role 為 none 的用戶**：role 為 "none" 的用戶不會顯示在登入列表
- **影片背景**：登入／設定畫面可以使用影片當背景（會修改 base-world 檔案）  
  支援格式：**MP4**（`.mp4`, `.m4v`）、**WebM**（`.webm`）、**Ogg**（`.ogv`）。實際播放取決於瀏覽器的 HTML5 `<video>` 支援度；MP4（H.264）與 WebM 通常支援度最好。
- **設定面板切換按鈕**：加入管理員用的返回設定面板按鈕（`<`）
- **隱藏面板**：可選擇隱藏世界描述與遊戲詳情區塊
- **單行 UI**：將登入區塊集中成單行、置中顯示
- **移除標題文字**：可移除「Join Game Session」標題
- **主 Logo 覆寫**：透過 `--main-logo` CSS 變數自訂或清除主 Logo
- **標題發光效果**：提供 8 組文字陰影配色可選（第一組「Ocean Blue / 海洋藍 (xtlcme)」）
- **標題字級調整**：自訂登入標題的字體大小
- **備份與還原**：修改前會自動建立 `*.bak.orig` 備份，支援一鍵還原

## 環境需求

- **Node.js**（建議使用 LTS 版）
- Foundry VTT（已測試 v13.x，內建 v13.351 的設定模板）

## 安裝與執行

### Windows（PowerShell 5.1）

1. **選擇放置資料夾（建議）** — 例如 `C:\Games\foundry-tools\`（不要放在 `Program Files` 之下）。
2. **（可選）使用系統管理員身分開啟 PowerShell** — 當你的 Foundry 安裝在 `C:\Program Files\...` 底下，又遇到權限不足（Access denied）時才需要。  
   - 開始選單 → 輸入 `powershell` → 右鍵 **Windows PowerShell** → 選 **以系統管理員身分執行**
3. **下載最新 Release 的 zip 到該資料夾**：

```powershell
mkdir C:\Games\foundry-tools -Force
cd C:\Games\foundry-tools
Invoke-WebRequest -Uri "https://github.com/zeteticl/foundryVTT-login-page-customizer/releases/latest/download/foundryVTT-login-page-customizer.zip" -OutFile "foundryVTT-login-page-customizer.zip"
```

4. **解壓縮**：

```powershell
Expand-Archive -Path "foundryVTT-login-page-customizer.zip" -DestinationPath ".\foundryVTT-login-page-customizer" -Force
cd .\foundryVTT-login-page-customizer
```

5. **執行工具**：

```bat
.\fvtt-login-patcher.cmd
```

### Linux

1. **選擇放置資料夾（建議）** — 例如 `~/foundry-tools/`。
2. **下載並解壓最新 Release zip**：

```bash
mkdir -p ~/foundry-tools
cd ~/foundry-tools
curl -L -o foundryVTT-login-page-customizer.zip \
  https://github.com/zeteticl/foundryVTT-login-page-customizer/releases/latest/download/foundryVTT-login-page-customizer.zip
unzip -o foundryVTT-login-page-customizer.zip -d foundryVTT-login-page-customizer
cd foundryVTT-login-page-customizer
```

3. **（只需一次）給執行權限**：

```bash
chmod +x fvtt-login-patcher.sh
```

4. **執行工具**：

```bash
./fvtt-login-patcher.sh
```

如果仍然出現 **Permission denied**，可以改用 Node 直接執行腳本：

```bash
node src/fvtt-login-patcher.mjs
```

### macOS

1. **選擇放置資料夾（建議）** — 例如 `~/foundry-tools/`。
2. **下載並解壓最新 Release zip**：

```bash
mkdir -p ~/foundry-tools
cd ~/foundry-tools
curl -L -o foundryVTT-login-page-customizer.zip \
  https://github.com/zeteticl/foundryVTT-login-page-customizer/releases/latest/download/foundryVTT-login-page-customizer.zip
unzip -o foundryVTT-login-page-customizer.zip -d foundryVTT-login-page-customizer
cd foundryVTT-login-page-customizer
```

3. **（只需一次）給執行權限**：

```bash
chmod +x fvtt-login-patcher.sh
```

4. **執行工具**：

```bash
./fvtt-login-patcher.sh
```

如果仍然出現 **Permission denied**，可以改用 Node 直接執行腳本：

```bash
node src/fvtt-login-patcher.mjs
```

### 互動流程說明

啟動工具後，依指示輸入：

1. **Foundry 安裝路徑** — 例如：
   - Windows：`C:\Program Files\Foundry Virtual Tabletop\resources\app`
   - Linux/macOS：預設會帶出 `~/foundryvtt/resources/app`，可依實際安裝路徑修改
2. **模式** —  
   - **Modify mode / 修改模式**：先自動還原到備份，再套用這次的設定  
   - **Restore mode / 還原模式**：從 `*.bak.orig` 還原回原始檔案
3. **各項選項** — 例如是否隱藏 role 為 none 的用戶、啟用影片背景、隱藏面板、標題發光配色與字級等。

備份檔會以 `*.bak.orig` 的形式存放在 Foundry 相同目錄下。若想還原，重新執行工具並選擇 Restore 模式即可。

## 版本支援

本工具會讀取 Foundry 安裝目錄中的 `package.json`，根據其中的版本資訊選擇 `src/HTML/` 下對應的 profile（例如 `v13.351`）。  
如果你的 Foundry 版本不同，可以在該資料夾中新增或調整 profile（`profile.json` + `snippets/`）。

## 專案結構

```text
src/
├── fvtt-login-patcher.mjs   # 主程式腳本
├── fvtt-login-patcher.cmd   # Windows 啟動批次檔
├── fvtt-login-patcher.sh    # Unix 系統啟動腳本
└── HTML/v13.351/            # 版本模板（profile.json 與 snippets/）
```

## 鳴謝

- **xtlcme** — 原始討論與靈感來源：  
  [純美蘋果園 — 【優化】魔改動態登錄界面v2](https://www.goddessfantasy.net/bbs/index.php?topic=126755.0)

## 注意事項

- 此工具會直接修改 Foundry 安裝目錄底下的檔案，請務必保留備份（工具會自動建立 `*.bak.orig`）。  
- 更新 Foundry 版本時，可能會覆蓋掉已修改的檔案；如需保留登入頁自訂效果，建議更新後重新執行本工具。  
- 若在 Windows 上遇到權限問題，可考慮以系統管理員身分執行 PowerShell，或將工具與 Foundry 安裝放在非 `Program Files` 的路徑。
