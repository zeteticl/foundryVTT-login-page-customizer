#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { stdin as input, stdout as output } from "node:process";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_ROOT = path.join(SCRIPT_DIR, "HTML");
const USERS_BLOCK_REGEX = /{{#each users}}[\s\S]*?{{\/each}}/;
const WINDOWS_DEFAULT_APP_ROOT = "C:\\Program Files\\Foundry Virtual Tabletop\\resources\\app";

const rl = readline.createInterface({ input, output });

const normalizeYesNo = (value) => {
  const v = String(value ?? "").trim().toLowerCase();
  if (["y", "yes", "1", "true", "是", "好", "要"].includes(v)) return true;
  if (["n", "no", "0", "false", "否", "不要", "不用"].includes(v)) return false;
  return null;
};

const askYesNo = async (question, defaultValue) => {
  const suffix = defaultValue ? " [Y/n]" : " [y/N]";
  while (true) {
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    if (!answer) return defaultValue;
    const parsed = normalizeYesNo(answer);
    if (parsed !== null) return parsed;
    console.log("Please answer yes or no. / 請回答 yes 或 no。");
  }
};

const askChoice = async (question, choices, defaultIndex = 0) => {
  if (!choices.length) throw new Error("No choices provided");
  console.log(question);
  choices.forEach((label, index) => {
    const mark = index === defaultIndex ? "*" : " ";
    console.log(`  ${index + 1}) ${label} ${mark}`);
  });

  while (true) {
    const raw = (await rl.question(`Select / 請選擇 [${defaultIndex + 1}]: `)).trim();
    if (!raw) return defaultIndex;
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= choices.length) return n - 1;
    console.log("Invalid selection. / 無效選擇。");
  }
};

const readIfExists = async (filePath) => {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
};

const pathExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const ensureBackup = async (filePath, backupTag) => {
  const backupPath = `${filePath}.bak.${backupTag}`;
  await fs.copyFile(filePath, backupPath);
  return backupPath;
};

const timestampTag = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
};

const resolveAppRoot = async (rootInput) => {
  const directPackage = path.join(rootInput, "package.json");
  const nestedPackage = path.join(rootInput, "app", "package.json");

  if (await readIfExists(directPackage)) return rootInput;
  if (await readIfExists(nestedPackage)) return path.join(rootInput, "app");

  throw new Error(`Could not find Foundry app root from: ${rootInput}`);
};

const getDefaultRoot = async () => {
  if (await pathExists(WINDOWS_DEFAULT_APP_ROOT)) return WINDOWS_DEFAULT_APP_ROOT;
  return process.cwd();
};

const detectVersionTag = async (appRoot) => {
  const packagePath = path.join(appRoot, "package.json");
  const packageText = await readIfExists(packagePath);
  if (!packageText) throw new Error(`Missing package.json at ${packagePath}`);
  const pkg = JSON.parse(packageText);

  const generation = pkg?.release?.generation;
  const build = pkg?.release?.build;
  if ((typeof generation !== "number") || (typeof build !== "number")) {
    throw new Error("package.json does not contain release.generation/build");
  }

  return {
    numeric: `${generation}.${build}`,
    tag: `v${generation}.${build}`
  };
};

const listProfiles = async () => {
  const entries = await fs.readdir(PROFILE_ROOT, { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("v"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const profiles = [];
  for (const tag of dirs) {
    const profilePath = path.join(PROFILE_ROOT, tag, "profile.json");
    const text = await readIfExists(profilePath);
    if (!text) continue;
    const parsed = JSON.parse(text);
    profiles.push({
      tag,
      version: parsed.version ?? tag.replace(/^v/, ""),
      profilePath
    });
  }
  return profiles;
};

const loadProfile = async (versionTag) => {
  const profileDir = path.join(PROFILE_ROOT, versionTag);
  const profilePath = path.join(profileDir, "profile.json");
  const profileText = await readIfExists(profilePath);
  if (!profileText) {
    throw new Error(`Missing profile for ${versionTag}: ${profilePath}`);
  }

  const profile = JSON.parse(profileText);
  const snippets = {};
  for (const [name, relPath] of Object.entries(profile.snippets ?? {})) {
    const absolutePath = path.join(profileDir, relPath);
    const text = await readIfExists(absolutePath);
    if (!text) throw new Error(`Missing snippet ${name}: ${absolutePath}`);
    snippets[name] = text.replace(/\r\n/g, "\n").trimEnd();
  }

  return { profileDir, profile, snippets };
};

const injectBlockAfterFormTag = (content, marker, blockText) => {
  if (content.includes(marker)) return content;
  const wrapped = `\n    {{!-- ${marker} --}}\n${blockText}`;
  return content.replace(/<form[^>]*>/, (match) => `${match}${wrapped}`);
};

const applyActivePlayersOnly = (content, replacementBlock) => {
  if (!USERS_BLOCK_REGEX.test(content)) return { content, changed: false };
  const updated = content.replace(USERS_BLOCK_REGEX, replacementBlock);
  return { content: updated, changed: updated !== content };
};

const hideRootTag = (content, tagName) => {
  const re = new RegExp(`<${tagName}([^>]*)>`);
  const match = content.match(re);
  if (!match) return { content, changed: false };
  const attrs = match[1] ?? "";
  if (/style\s*=\s*"/i.test(attrs) && /display\s*:\s*none/i.test(attrs)) return { content, changed: false };

  let newAttrs = attrs;
  if (/style\s*=\s*"/i.test(attrs)) {
    newAttrs = attrs.replace(/style\s*=\s*"([^"]*)"/i, (_m, styleValue) => {
      const normalized = styleValue.trim();
      const suffix = normalized && !normalized.endsWith(";") ? ";" : "";
      return `style="${normalized}${suffix} display: none;"`;
    });
  } else {
    newAttrs = `${attrs} style="display: none;"`;
  }

  const updated = content.replace(re, `<${tagName}${newAttrs}>`);
  return { content: updated, changed: updated !== content };
};

const patchBaseWorldForVideo = (content, rule) => {
  let updated = content;
  updated = updated.replace(rule.backgroundCategoriesFrom, rule.backgroundCategoriesTo);
  updated = updated.replace(rule.backgroundValidationFrom, rule.backgroundValidationTo);
  return { content: updated, changed: updated !== content };
};

const getBackupCandidatesForFile = async (filePath) => {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const backups = entries
    .filter((entry) => entry.isFile() && entry.name.startsWith(`${base}.bak.`))
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      const tag = entry.name.slice(`${base}.bak.`.length);
      return { tag, fullPath };
    });

  const withStats = [];
  for (const backup of backups) {
    const stats = await fs.stat(backup.fullPath);
    withStats.push({ ...backup, mtimeMs: stats.mtimeMs });
  }
  return withStats.sort((a, b) => b.mtimeMs - a.mtimeMs);
};

const collectBackupTags = async (appRoot, relativePaths) => {
  const tagMap = new Map();

  for (const relativePath of relativePaths) {
    const targetPath = path.join(appRoot, relativePath);
    const targetExists = await readIfExists(targetPath);
    if (targetExists === null) continue;

    const backups = await getBackupCandidatesForFile(targetPath);
    for (const backup of backups) {
      if (!tagMap.has(backup.tag)) {
        tagMap.set(backup.tag, {
          tag: backup.tag,
          newest: backup.mtimeMs,
          count: 0,
          files: new Set()
        });
      }
      const rec = tagMap.get(backup.tag);
      rec.count += 1;
      rec.newest = Math.max(rec.newest, backup.mtimeMs);
      rec.files.add(relativePath);
    }
  }

  return Array.from(tagMap.values())
    .map((t) => ({ ...t, files: Array.from(t.files).sort() }))
    .sort((a, b) => b.newest - a.newest);
};

const restoreFromBackupTag = async (appRoot, relativePaths, tag) => {
  const restored = [];
  const missing = [];

  for (const relativePath of relativePaths) {
    const targetPath = path.join(appRoot, relativePath);
    const backupPath = `${targetPath}.bak.${tag}`;
    const backupText = await readIfExists(backupPath);
    if (backupText === null) {
      missing.push(relativePath);
      continue;
    }
    await fs.copyFile(backupPath, targetPath);
    restored.push(relativePath);
  }

  return { restored, missing };
};

const main = async () => {
  console.log("FVTT Login Patcher / Foundry 登入頁修補工具");
  console.log("Cross-platform Node.js CLI. / 跨平台 Node.js 命令列工具。\n");

  const defaultRoot = await getDefaultRoot();
  const rootAnswer = (await rl.question(
    `Target Foundry app root or repo root / 目標 Foundry app 或 repo 根目錄\n(default / 預設: ${defaultRoot})\n> `
  )).trim();
  const root = path.resolve(rootAnswer || defaultRoot);
  const appRoot = await resolveAppRoot(root);

  const modeIndex = await askChoice(
    "Mode / 模式",
    [
      "Modify mode / 修改模式 (backup + patch)",
      "Restore mode / 還原模式 (from backup)"
    ],
    0
  );
  const isRestoreMode = modeIndex === 1;

  const detectedVersion = await detectVersionTag(appRoot);
  const profiles = await listProfiles();
  if (!profiles.length) {
    throw new Error(`No profile found under: ${PROFILE_ROOT}`);
  }

  console.log(`Detected FVTT version / 偵測版本: ${detectedVersion.numeric}`);

  let selectedProfileTag;
  if (profiles.length === 1) {
    selectedProfileTag = profiles[0].tag;
    console.log(`Profile / 模板: only one available -> ${selectedProfileTag}\n`);
  } else {
    const defaultIdx = Math.max(
      profiles.findIndex((p) => p.tag === detectedVersion.tag),
      0
    );
    const labels = profiles.map((p) => `${p.tag} (profile version: ${p.version})`);
    const choice = await askChoice("Available profiles / 可用版本模板", labels, defaultIdx);
    selectedProfileTag = profiles[choice].tag;
    console.log("");
  }

  const { profile, snippets } = await loadProfile(selectedProfileTag);

  console.log(`Using profile / 使用模板: ${selectedProfileTag}`);
  console.log(`Backup support / 備份功能: ENABLED (.bak.<timestamp>)\n`);

  const targetRelativePaths = [
    profile.files.joinForm,
    profile.files.joinSetup,
    profile.files.joinWorld,
    profile.files.joinDetails,
    profile.files.baseWorld
  ];

  if (isRestoreMode) {
    const tags = await collectBackupTags(appRoot, targetRelativePaths);
    if (!tags.length) {
      console.log("No backups found. / 找不到備份檔案。");
      return;
    }

    const labels = tags.map((t) => `${t.tag} (${t.count} files)`);
    const tagIdx = await askChoice("Select backup tag / 選擇要還原的備份批次", labels, 0);
    const selectedTagInfo = tags[tagIdx];
    const selectedTag = selectedTagInfo.tag;

    const confirm = await askYesNo(`Restore backup tag ${selectedTag}? / 要還原 ${selectedTag} 嗎？`, true);
    if (!confirm) {
      console.log("Cancelled. / 已取消。");
      return;
    }

    const { restored, missing } = await restoreFromBackupTag(appRoot, selectedTagInfo.files, selectedTag);
    console.log("\nRestore completed. / 還原完成。");
    if (restored.length) {
      console.log("Restored files / 已還原檔案:");
      restored.forEach((f) => console.log(`- ${f}`));
    }
    if (missing.length) {
      console.log("Missing backups for files / 下列檔案沒有該批次備份:");
      missing.forEach((f) => console.log(`- ${f}`));
    }
    return;
  }

  const activeOnly = await askYesNo(
    "1) Show only active players in user list? / 只顯示 active 玩家？",
    true
  );
  const supportVideo = await askYesNo(
    "2) Enable video background support? / 啟用影片背景支援？",
    true
  );
  const setupToggle = await askYesNo(
    "3) Add admin setup panel with collapse button '<'? / 加入管理員返回設定面板與收合按鈕 '<'？",
    true
  );
  const hideWorld = await askYesNo(
    "4) Hide world description panel? / 隱藏世界描述區塊？",
    true
  );
  const hideDetails = await askYesNo(
    "5) Hide game details panel? / 隱藏遊戲詳情區塊？",
    true
  );

  console.log("\nPlanned changes / 預計修改：");
  console.log(`- Active players only / 只顯示 active 玩家: ${activeOnly ? "ON" : "OFF"}`);
  console.log(`- Video support / 影片支援: ${supportVideo ? "ON" : "OFF"}`);
  console.log(`- Setup toggle / 返回設定收合按鈕: ${setupToggle ? "ON" : "OFF"}`);
  console.log(`- Hide world panel / 隱藏世界描述: ${hideWorld ? "ON" : "OFF"}`);
  console.log(`- Hide details panel / 隱藏遊戲詳情: ${hideDetails ? "ON" : "OFF"}`);
  console.log(`- App root / 目標 app 目錄: ${appRoot}`);
  console.log(`- Profile / 版本模板: ${profile.version}\n`);

  const shouldApply = await askYesNo("Apply changes now? / 現在套用修改？", true);
  if (!shouldApply) {
    console.log("Cancelled. / 已取消。");
    return;
  }

  const backupTag = timestampTag();
  const touched = [];
  const backups = [];
  const warnings = [];

  const patchFile = async (relativePath, patcher) => {
    const fullPath = path.join(appRoot, relativePath);
    const before = await readIfExists(fullPath);
    if (before === null) {
      warnings.push(`Missing file / 檔案不存在: ${relativePath}`);
      return;
    }
    const { content: after, changed } = patcher(before);
    if (!changed) return;
    const backupPath = await ensureBackup(fullPath, backupTag);
    await fs.writeFile(fullPath, after, "utf8");
    touched.push(relativePath);
    backups.push(path.relative(appRoot, backupPath));
  };

  await patchFile(profile.files.joinForm, (before) => {
    let after = before;
    if (activeOnly) {
      after = applyActivePlayersOnly(after, snippets.activeUsersEachBlock).content;
    }
    if (supportVideo) {
      after = injectBlockAfterFormTag(after, profile.markers.video, snippets.videoBlock);
    }
    if (setupToggle) {
      after = injectBlockAfterFormTag(after, profile.markers.toggle, snippets.toggleBlock);
    }
    return { content: after, changed: after !== before };
  });

  if (supportVideo) {
    await patchFile(profile.files.baseWorld, (before) => patchBaseWorldForVideo(before, profile.baseWorldVideoPatch));
  }

  if (hideWorld) {
    await patchFile(profile.files.joinWorld, (before) => hideRootTag(before, "article"));
  }

  if (hideDetails) {
    await patchFile(profile.files.joinDetails, (before) => hideRootTag(before, "div"));
  }

  if (setupToggle) {
    const joinSetupPath = path.join(appRoot, profile.files.joinSetup);
    if ((await readIfExists(joinSetupPath)) === null) {
      warnings.push(`Missing file / 檔案不存在: ${profile.files.joinSetup}`);
    }
  }

  console.log("\nDone. / 完成。");
  if (touched.length) {
    console.log("Updated files / 已更新檔案:");
    touched.forEach((f) => console.log(`- ${f}`));
  } else {
    console.log("No content changed. / 沒有可套用的變更。");
  }

  if (backups.length) {
    console.log("\nBackups / 備份檔案:");
    backups.forEach((f) => console.log(`- ${f}`));
  }

  if (warnings.length) {
    console.log("\nWarnings / 警告:");
    warnings.forEach((w) => console.log(`- ${w}`));
  }
};

main()
  .catch((error) => {
    console.error("\nFailed / 失敗:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await rl.close();
  });
