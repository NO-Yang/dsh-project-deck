# dsh-project-deck

<p align="center">
  <b>Modern Project Deck & Group Organizer for DeepSeek Harness (DSH)</b><br>
  Multi-workspace project grouping · Strict workspace isolation · Full session lifecycle · Native UI alignment · One-click view toggle
</p>

<p align="center">
  <b>English</b> | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## 💡 Why dsh-project-deck?

In daily development with DeepSeek Harness (DSH):
1. **Cluttered Workspaces**: Multiple repositories belonging to the same project (frontend, backend, mobile) all crowd into a single flat list.
2. **Context Confusion**: Merging directories into a monorepo breaks physical execution boundaries (`cwd`), Git histories, and session contexts.
3. **Missing Session Lifecycle**: No native one-click archive drawer or safe permanent session deletion.
4. **Discordant Third-Party UI**: Many community grouping plugins look alien, with jarring colors, mismatched fonts, and broken dark mode adaptation.

**`dsh-project-deck`** is designed to solve these issues: an elegant, IDE-grade collapsible tree view that keeps all workspace execution boundaries strictly isolated.

---

## ✨ Features

- 📁 **Three-Tier Hierarchy**: `Project Group (Folder) ➔ Workspace (Directory) ➔ Dynamic Session (Chat)`, clean, organized, and freely collapsible.
- 🛡️ **Strict Workspace Isolation**: Each workspace retains 100% of its physical `cwd` path, independent Git repository boundary, and session context. Zero interference.
- 📦 **Complete Session Lifecycle**:
  - **Quick Start (`+`)**: Create a session directly under any workspace row.
  - **Archive (`📦`)**: Stash inactive sessions into the workspace's collapsible "Archived" drawer.
  - **Restore (`↩️`)**: Unarchive history sessions back to the active list losslessly.
  - **Permanent Delete (`🗑️`)**: Safe confirmation dialog paired with host RPC cleanup, disk transcript removal, and persistent tombstone filtering.
- 🎨 **1:1 Native Visual Alignment**:
  - Pixel-perfect typography using `font-family: inherit` and native 14px / 20px proportions.
  - Adaptive theming leveraging DSH CSS tokens and `color-mix`, supporting both Light and Dark modes seamlessly.
  - Running pulse dot indicators and smooth chevron transitions.
- ⚡ **Seamless One-Click Hot Toggle**:
  - Instant toggle button at both top header and sidebar footer to switch between the custom Project Deck and DSH's native workspace browser without restarting.

---

## 🚀 Installation

### Option 1: Via DeepSeek Harness Plugin Manager (Recommended)

1. Open **DeepSeek Harness**.
2. Navigate to **Settings** ➔ **Plugins** ➔ **Install / Market**.
3. In the repository / install field, enter:
   ```text
   github:NO-Yang/dsh-project-deck
   ```
   Or the full repository URL:
   ```text
   https://github.com/NO-Yang/dsh-project-deck
   ```
4. Click **Install**.
5. Restart DeepSeek Harness to activate the Project Deck view!

---

### Option 2: Via Command Line (pnpm / CLI)

Install directly into your DSH desktop profile:

```powershell
# Navigate to DSH desktop profile directory
cd $env:USERPROFILE\.dsh\profiles\desktop

# Install directly from GitHub
pnpm add github:NO-Yang/dsh-project-deck
```

If you have the `dsh` CLI available:
```bash
dsh plugin --profile desktop add github:NO-Yang/dsh-project-deck
```

Quit and restart DeepSeek Harness completely.

---

### Option 3: Local Development & Link

```powershell
# 1. Clone repository
git clone https://github.com/NO-Yang/dsh-project-deck.git E:\Project\DSH\dsh-project-deck

# 2. Create directory junction to DSH profile node_modules
New-Item -ItemType SymbolicLink `
  -Path "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-project-deck" `
  -Target "E:\Project\DSH\dsh-project-deck"

# 3. Add "dsh-project-deck": "1.0.0" to dependencies in $env:USERPROFILE\.dsh\profiles\desktop\package.json
```

---

## 📖 Usage

1. **New Group**: Click `+ New Group` at the top of the sidebar and enter a name (e.g., `XXXXGroup`).
2. **Assign Workspaces**: Any detected workspace defaults to the "Uncategorized" section. Use the dropdown on each workspace row to assign it to a group folder.
3. **Start Session**: Hover over any workspace row and click `+`.
4. **Archive & Delete**: Hover over any session row to archive (`📦`) or delete (`🗑️`).
5. **Toggle Native View**: Click `Native View` anytime to switch back to DSH's default workspace list.

---

## 📄 License

[MIT License](LICENSE) © 2026 Gjx
