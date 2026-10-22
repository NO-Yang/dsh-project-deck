# dsh-project-deck

<p align="center">
  <b>DeepSeek Harness (DSH) 现代项目组与工作区编排插件</b><br>
  多工程文件夹归组 · 严格工作区隔离 · 完整会话生命周期 · 原生视觉对齐 · 一键视图切换
</p>

<p align="center">
  <a href="README.md">English</a> | <b>简体中文</b>
</p>

---

## 💡 为什么需要本插件？

在 DeepSeek Harness (DSH) 日常开发中，许多开发者面临以下痛点：
1. **多工程管理混乱**：同一个业务线下可能有前端、后端、移动端等多个独立仓库工作区，全部混在左侧列表中，查找繁琐。
2. **上下文混淆风险**：单纯合并目录会破坏工作区的执行边界（`cwd`）、Git 独立性和会话历史。
3. **缺少会话治理能力**：难以彻底删除无用会话或方便地归档/恢复会话。
4. **第三方插件 UI 突兀**：市面上一些工作区归组插件底色、字体与原生 DSH 差异极大，缺乏系统统一感。

**`dsh-project-deck`** 专为解决上述问题而生，提供类似 IDE 树形工程分组的高颜值管理体验，同时 100% 保持每个工作区的物理独立。

---

## ✨ 核心特性

- 📁 **三级层级管理**：`项目组（文件夹） ➔ 独立工作区（工程目录） ➔ 动态会话（聊天流）`，层级分明，支持任意折叠与展开。
- 🛡️ **严格工作区物理隔离**：工作区仅作为显示归组，每个工程完全保留自己独立的 `cwd` 路径、Git 边界与环境变量，绝不产生交叉混淆。
- 📦 **完整的会话生命周期**：
  - **快速发起（`+`）**：在任意工程行直接新建该工程下的会话。
  - **安全归档（`📦`）**：不常用的会话一键收纳进工程底部的「已归档」折叠抽屉中。
  - **无损恢复（`↩️`）**：在已归档列表中一键将历史会话恢复至活跃主列表。
  - **彻底物理删除（`🗑️`）**：带二次确认弹窗，联动 DSH 宿主 RPC、内存注册表与磁盘日志文件执行不可逆的彻底清理，并支持跨视图切换持久化，绝不复活。
- 🎨 **100% 原生视觉与排版对齐**：
  - 严格采用系统字体（`font-family: inherit`）与原生 14px / 20px 比例，避免过小或模糊。
  - 采用 DSH 系统的 CSS 变量与 `color-mix` 自适应，完美融入系统浅色（Light）与深色（Dark）模式。
  - 动态呼吸光点（运行中状态）、细线条折叠动画。
- ⚡ **一键双向无缝热切换**：
  - 顶部与底部均提供「原生视图 / 项目组视图」切换入口，秒级热重载，无需重启软件即可在默认列表与分组树之间自由切换。

---

## 🚀 插件式安装指南

### 方法一：通过 DeepSeek Harness 插件管理器（推荐）

1. 打开 **DeepSeek Harness**。
2. 进入 **设置 (Settings)** ➔ **插件 (Plugins)** ➔ **安装第三方插件 / 插件市场**。
3. 在插件搜索/安装输入框中，输入 GitHub 仓库标识：
   ```text
   github:NO-Yang/dsh-project-deck
   ```
   或直接输入仓库地址：
   ```text
   https://github.com/NO-Yang/dsh-project-deck
   ```
4. 点击 **安装 (Install)**。
5. 安装完成后重启 DeepSeek Harness，左侧侧边栏即可自动加载「项目组」视图！

---

### 方法二：通过命令行（CLI / pnpm）一键安装

在 DeepSeek Harness 的 desktop profile 目录下直接安装：

```powershell
# 进入 DSH 桌面配置目录
cd $env:USERPROFILE\.dsh\profiles\desktop

# 使用 pnpm 直接安装 GitHub 源
pnpm add github:NO-Yang/dsh-project-deck
```

若使用的是带有 `dsh` CLI 命令的环境：
```bash
dsh plugin --profile desktop add github:NO-Yang/dsh-project-deck
```

安装后完全退出并重新启动 DeepSeek Harness 即可生效。

---

### 方法三：本地二次开发与软链接调试

如果你克隆了源码并在本地进行二次开发：

```powershell
# 1. 克隆代码到本地
git clone https://github.com/NO-Yang/dsh-project-deck.git E:\Project\DSH\dsh-project-deck

# 2. 在 DSH 桌面 profile 的 node_modules 中创建软链接
New-Item -ItemType SymbolicLink `
  -Path "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-project-deck" `
  -Target "E:\Project\DSH\dsh-project-deck"

# 3. 在 $env:USERPROFILE\.dsh\profiles\desktop\package.json 中的 dependencies 与 dsh.profile.bundles 中加入 "dsh-project-deck"
```

---

## 📖 使用说明

1. **新建项目组**：点击侧栏顶部的「新建组」按钮，输入项目组名称（例如：`xxx项目群`）。
2. **工作区归组**：
   - 默认新检测到的工程会展示在「未分类工程」折叠块中。
   - 在工作区行的下拉框中选择目标项目组，工程将即时归入对应项目文件夹。
3. **发起新会话**：鼠标悬停在对应工程行，点击右侧的 `+` 图标。
4. **归档与删除**：
   - 鼠标悬停在会话行，点击 `📦` 即可归档。
   - 鼠标悬停在会话行，点击红色垃圾桶 `🗑️` 即可彻底删除该会话。
5. **切换视图**：随时点击顶部的「原生视图」按钮或底部的「切换视图」按钮，随时回退至 DSH 原生工作区列表。

---

## ⚙️ 架构与实现原理

- **零重型依赖（Zero Heavy Dependencies）**：基于原生 React 与 DSH 内置平台模块，免去庞大打包开销。
- **Cordis 插件契约**：声明 `cordis.patch.yml` 将自身插桩进入 DSH bundle 树，宿主自动拦截与挂载。
- **数据存储**：
  - 项目组映射关系持久化于 `localStorage`（`dsh.project_deck.groups.v1`）。
  - 会话底层删除通过调用 DSH 原生 `remote.workspaceRegistry.deleteSession` RPC 与多层磁盘清理机制，确保安全无残留。

---

## 📄 许可证

[MIT License](LICENSE) © 2026 Gjx
