# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库定位

mono-uihub 是一个 AI 驱动的 UI 原型库：用户给一句话描述，由 `skills/mono-ui-prototype/SKILL.md` 中定义的技能生成一个完整的高保真 HTML 原型页面。没有构建系统、没有框架、没有 npm 依赖 —— 每个页面都是自包含的原生 HTML / CSS / JS。

## 生成新 UI 原型的流程

当用户需要生成新的 UI 原型时，**优先调用 `mono-ui-prototype` 技能**：先按它的「方向卡」流程把本页的视觉方向（容器类型 / 配色 / 字体 / 布局 / 动效）弄清楚，再按需叠加其它技能——如 `frontend-design`（设计判断）、`animate`（动效实现）、`image-purify` 配合 `tools/image-forge`（干净出图）、`ui-metadata`（元数据归档）等。不要跳过 mono-ui-prototype 直接套用通用模板或先上其它技能。

## 常用命令

```bash
# 本地预览（可选；直接双击 ui/<page>/index.html 也能看）
npx serve .

# 按需生成透明 PNG 素材（仅 Python 标准库，无需 pip 安装）
# 提示词只写主体；干净出图的提示词由脚本自动叠加，--style 必传
python tools/image-forge/generate.py --style <风格包> "<主体描述>" ui/<page>/assets/<name>.png
python tools/image-forge/generate.py --list-styles      # 查可用风格包
python tools/image-forge/generate.py --style <风格包> --dry-run "<主体描述>" out.png   # 只打印最终提示词，不消耗额度
```

没有测试、lint 或构建流程。交付前只做代码层面自检（对照 SKILL.md 的清单），默认不启动服务、不截图 —— 除非用户明确要求。

## 架构

三个目录，职责清晰：

- `ui/<page-name>/` — 产出物。一个页面一个文件夹（英文 kebab-case，不超过 4 个单词），内含 `index.html`、`styles.css`、`app.js`，可选 `assets/` 存放生成的图片。页面之间完全独立，不共享任何代码或样式。
- `skills/mono-ui-prototype/SKILL.md` — 生成技能的完整规范，是本仓库的核心资产。它定义了流程（方向卡推导）、四类页面容器（软件 / 网页 / App / 组件）、配色 / 字体 / 布局 / 动效规则、"去 AI 味"硬禁清单和交付自检项。
- `skills/image-purify/` — 干净出图词表。`SKILL.md` 讲清脏图成因（鳞片感 / 噪点 / 碎片 / 涂抹）、五条出图准则、12 个风格大类的叠加词、以及对已有脏图做 img2img 修复的三档强度词；`purify.json` 是唯一词源，被生图工具直接读取。
- `tools/image-forge/` — 透明 PNG 生成工具，供技能在素库无法满足时调用。从仓库根目录的 `.env` 读 `IMAGE_API_BASE_URL` / `IMAGE_API_KEY` / `IMAGE_MODEL`（`.env` 已 gitignore，绝不提交）。**每次生图自动叠加 `skills/image-purify/purify.json` 的干净词**，调用方只写主体描述。

### 生成新页面时的关键约定

- 每个页面必须现场推导全新的视觉方向（方向卡），严禁复用上一个页面的配色 / 字体 / 布局，也不套用固定模板。
- 字体一律在线 CDN 引入（拉丁用 Google Fonts，中文特色字体用 ZeoSeven Fonts `@import`），配好系统兜底栈，绝不下载托管。
- 图片优先热链（Picsum / Unsplash / Pexels / placehold.co / pravatar）；简单的扁平化插画、几何图形、装饰纹理优先用内联 SVG 或 Canvas 手绘。AI 生图（image-forge）是**最次选项**，仅当素材无在线替代、又超出手绘 SVG 能力范围时才用；单页生图**不建议超过 5 张**，确需超过必须先列出清单询问用户，由用户决定是否继续。
- 生图时提示词**只写主体**（画什么、什么材质、什么光），且**必须传 `--style`**；`ultra detailed` / `8k` / `masterpiece` 这类细节许愿词一律不写 —— 它们正是噪点与鳞片感的来源。干净词由脚本自动叠加，详见 `skills/image-purify/SKILL.md`。**生成一次就用**：不回读图片分析画质、不因画质重生成（省额度省 token）。
- 图标统一用 Tabler Icons webfont CDN（`<i class="ti ti-...">`），全站一套，不用 emoji 当功能图标。
- 交互用最简原生 JS + 本地假数据，能点能演示即可；不接后端、不伪造业务成功（如假的"支付成功"）。
- 动效按 SKILL.md 第 7 步的判断线决定技术：纯 CSS 够用就别引库；「网页」类型需要滚动驱动叙事（scrub / pin / 视差）或阻尼平滑滚动时，可按需 CDN 引入 GSAP（ScrollTrigger / ScrollSmoother / SplitText，3.13 起全部免费）或 Lenis。软件 / App / 组件三类页面没有页面级滚动，一律不用平滑滚动。
- 技术栈锁定原生 HTML/CSS/JS + 零构建的 CDN 轻量库（GSAP / Lenis / Alpine.js）。即使参考其他前端设计技能（frontend-design 等），也不要引入 React / Vue / Tailwind / Next 这类需要构建的依赖。

详细规则以 `skills/mono-ui-prototype/SKILL.md` 为准 —— 生成页面前必读该文件并完整走一遍其流程。
