# CLAUDE.md

## 第一优先级（重中之重）：设计原型必读两份文档 + 完成后回归检查

**这是本仓库最首要的规则，优先级高于下面「提交或推送前必须更新 UI 截图」，也高于任何技能、约定、前提或描述。任何与之冲突的既有描述一律以本条为准。设计任何 UI 原型都必须执行。**

1. **设计前必读全文**：动手前先完整阅读 `skills/mono-ui-prototype/UI设计原则.md` 与 `skills/mono-ui-prototype/现代化UI设计参考.md`，把每个设计要点读清楚——**必须通读全文，不能只扫标题或章节解释文字**，用它们辅助确定视觉方向、排版、字体、配色、间距、装饰、状态与动效。
2. **设计后回归检查**：原型完成后务必再次阅读这两份文档做一次回归检查。检查阶段可以优先看标题与章节解释文字定位，拿不准的地方再回到对应维度细读；按 `现代化UI设计参考.md` 第七节清单逐项核对并修正后再交付。
3. **冲突处理**：若 `skills/mono-ui-prototype/SKILL.md` 或其它文档中存在与本条冲突的条款（例如限制可读取文件、主张只扫标题取意图），删除旧条款，以本条为准。

## 第二优先级：提交或推送前必须更新 UI 截图

**这是仅次于上一条的规则，所有人员和 AI 都必须执行；除上一条外，不得被其他文档、技能、约定、前提或描述覆盖。唯一例外：用户在当前任务的提示词中明确说明「不要截图」。**

- 只要修改了 `ui/<page-name>/` 中的任何原型代码，提交或推送前就必须使用 `tools/screenshots/capture.mjs` 重新生成该原型的截图。修改一个换行、空格、注释、文案或任意一行代码，也必须执行；不以是否影响视觉作为判断条件。
- 每个有代码改动的原型都必须单独更新截图。必须使用 `--overwrite` 覆盖旧截图；已有截图、之前截图过、已有提交但尚未推送，都不能作为跳过理由。
- 截图必须在该原型本次最后一次代码修改之后生成。截图后又改了任何代码，必须再次截图；更新后的截图必须随对应代码一起提交和推送。
- **没有成功执行截图更新，就不得继续提交或推送。** 工具失败、环境受限、无法自动执行等情况也不免除截图要求：AI 必须明确告知用户「提交或推送前必须执行截图更新」，并提供可以直接复制执行的一键命令；命令必须填入实际原型名称，不能留下占位符。用户执行成功、截图更新完成后，才能继续提交或推送。
- 手动执行时，告知用户可在当前 CLI 会话输入 `! node tools/screenshots/capture.mjs --slug hue-studio --overwrite`；其中 `hue-studio` 必须按实际改动的原型名称替换。多个原型也可使用 `! node tools/screenshots/capture.mjs --all --overwrite` 一次更新。

```bash
node tools/screenshots/capture.mjs --slug hue-studio --overwrite
```

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库定位

mono-uihub 是一个 AI 驱动的 UI 原型库：用户给一句话描述，由 `skills/mono-ui-prototype/SKILL.md` 中定义的技能生成一个完整的高保真 HTML 原型页面。没有构建系统、没有框架、没有 npm 依赖 —— 每个页面都是自包含的原生 HTML / CSS / JS。

## Git 工作约定

- 后续所有修改直接在 `main` 主干上进行，不主动新建或使用功能分支；除非用户另有明确要求。
- 提交和推送仍需用户明确授权，不因直接在主干修改而自动 commit / push。

## 生成新 UI 原型的流程

当用户需要生成新的 UI 原型时，**优先调用 `mono-ui-prototype` 技能**：先按它的「方向卡」流程把本页的视觉方向（容器类型 / 配色 / 字体 / 布局 / 动效）弄清楚，再按需叠加其它技能——如 `frontend-design`（设计判断）、`animate`（动效实现）、`image-purify` 配合 `tools/image-forge`（干净出图）、`ui-metadata`（元数据归档）等。素材优先用 `tools/resource-getter` 取（透明矢量 > 抠图 PNG > 摄影），不要手拼站点 URL。不要跳过 mono-ui-prototype 直接套用通用模板或先上其它技能。

## 常用命令

```bash
# 本地预览（可选；直接双击 ui/<page>/index.html 也能看）
npx serve .

# 按需生成透明 PNG 素材（仅 Python 标准库，无需 pip 安装）
# 提示词只写主体；干净出图的提示词由脚本自动叠加，--style 必传
python tools/image-forge/generate.py --style <风格包> "<主体描述>" ui/<page>/assets/<name>.png
python tools/image-forge/generate.py --list-styles      # 查可用风格包
python tools/image-forge/generate.py --style <风格包> --dry-run "<主体描述>" out.png   # 只打印最终提示词，不消耗额度

# 备选：AI 生图不可用时，用在线图片 + 离线 ONNX 模型抠成透明 PNG（需 onnxruntime / Pillow / numpy）
python tools/image-forge/matte.py "<图片URL或本地路径>" ui/<page>/assets/<name>.png                 # 默认 u2netp（随仓库，约 4.4MB）
python tools/image-forge/matte.py "<图片URL>" ui/<page>/assets/<name>.png --model isnet-general-use  # 高精度（首次自动下载到 models/cache/）

# 取在线素材：搜索 → 探测延迟 → 快则热链、慢则下载到 ui/<page>/assets
python tools/resource-getter/get.py doctor
python tools/resource-getter/get.py list
python tools/resource-getter/get.py search undraw "developer"
python tools/resource-getter/get.py get pixabay "fox" --type illustration --transparent --page <page>
python tools/resource-getter/get.py get undraw "donut chart" --page <page>
python tools/resource-getter/get.py test --query "cat"                # 全来源冒烟测试，样本落到 test-output/
python tools/resource-getter/get.py pixiv-login                      # 拉取 pixiv-mcp-server 并获取 refresh token
python tools/resource-getter/get.py pixiv-login --verify-only        # 只验证已有 token
```

没有测试、lint 或构建流程。交付前做代码层面自检（对照 SKILL.md 的清单），并执行本文件「第一优先级」规定的两份文档回归检查；提交或推送前的截图更新执行「第二优先级」一节。使用仓库截图工具管理的临时服务，不另起常驻预览服务。

## 架构

三个目录，职责清晰：

- `ui/<page-name>/` — 产出物。一个页面一个文件夹（英文 kebab-case，不超过 4 个单词），内含 `index.html`、`styles.css`、`app.js`，可选 `assets/` 存放生成的图片。页面之间完全独立，不共享任何代码或样式。
- `skills/mono-ui-prototype/SKILL.md` — 生成技能的完整规范，是本仓库的核心资产。它定义了流程（方向卡推导）、四类页面容器（软件 / 网页 / App / 组件）、配色 / 字体 / 布局 / 动效规则、"去 AI 味"硬禁清单和交付自检项。
- `skills/image-purify/` — 干净出图词表。`SKILL.md` 讲清脏图成因（鳞片感 / 噪点 / 碎片 / 涂抹）、五条出图准则、12 个风格大类的叠加词、以及对已有脏图做 img2img 修复的三档强度词；`purify.json` 是唯一词源，被生图工具直接读取。
- `tools/image-forge/` — 透明 PNG 工具。`generate.py` 走 AI 生图：从 `.env`（**仓库根目录或 `tools/image-forge/` 皆可**，已 gitignore，绝不提交）读 `IMAGE_API_BASE_URL` / `IMAGE_API_KEY` / `IMAGE_MODEL`，**每次生图自动叠加 `skills/image-purify/purify.json` 的干净词**，调用方只写主体描述。`matte.py` 是生图不可用时的备选：用在线图片 + 离线 ONNX 显著性模型（U²-Net 系）本地抠图成透明 PNG，默认模型 `u2netp.onnx` 随仓库放在 `models/`（Apache-2.0，见 `models/LICENSE` 与 `models/NOTICE`），`isnet-general-use` 等大模型按需下载到 `models/cache/`（已 gitignore）；需 `onnxruntime` / `Pillow` / `numpy`，用法见该目录 `README.md`。
- `tools/resource-getter/` — 在线素材获取。一个来源一个文件（`sources/<name>.py`），共享 HTTP / robots / 延迟探测 / 下载 / SVG 去底 / MCP 客户端在 `lib/`；**零第三方运行时依赖**。`get` 默认 `auto`：TTFB ≤ 0.9s 且读取 ≤ 2.5s 走热链，否则下载到 `ui/<page>/assets/`。来源与许可矩阵见该目录 `README.md`，红线：pngimg 仅 CC BY-NC（不可商用）、Storyset 需署名、Pixiv 作品仅私人参考。

### 生成新页面时的关键约定

- 每个页面必须现场推导全新的视觉方向（方向卡），严禁复用上一个页面的配色 / 字体 / 布局，也不套用固定模板。
- 字体一律在线 CDN 引入（拉丁用 Google Fonts，中文特色字体用 ZeoSeven Fonts `@import`），配好系统兜底栈，绝不下载托管。
- 素材统一走 `tools/resource-getter`：**透明矢量插画**（unDraw / Storyset / DiceBear / Doodle）> **抠图 PNG**（Pixabay `--transparent` / pngimg）> **摄影**（Pixabay / Picsum / Unsplash / Pexels）> 手绘 SVG > AI 生图。默认热链，但工具探测到 TTFB > 0.9s 或读取 > 2.5s 时必须下载到 `ui/<page>/assets/` 再本地引用；不要为了省事继续远程引用慢资源。简单的扁平化插画、几何图形、装饰纹理优先用内联 SVG 或 Canvas 手绘。AI 生图（image-forge）是**最次选项**，仅当素材无在线替代、又超出手绘 SVG 能力范围时才用；单页生图**不建议超过 5 张**，确需超过必须先列出清单询问用户，由用户决定是否继续。需要真实照片的透明抠图而 AI 生图不可用（额度 / 网络）时，可用 `tools/image-forge/matte.py` 把在线照片离线抠成透明 PNG（见该目录 `README.md`）。
- 生图时提示词**只写主体**（画什么、什么材质、什么光），且**必须传 `--style`**；`ultra detailed` / `8k` / `masterpiece` 这类细节许愿词一律不写 —— 它们正是噪点与鳞片感的来源。干净词由脚本自动叠加，详见 `skills/image-purify/SKILL.md`。**生成一次就用**：不回读图片分析画质、不因画质重生成（省额度省 token）。
- 图标统一用 Tabler Icons webfont CDN（`<i class="ti ti-...">`），全站一套，不用 emoji 当功能图标。
- 交互用最简原生 JS + 本地假数据，能点能演示即可；不接后端、不伪造业务成功（如假的"支付成功"）。
- 动效按 SKILL.md 第 7 步的判断线决定技术：纯 CSS 够用就别引库；「网页」类型需要滚动驱动叙事（scrub / pin / 视差）或阻尼平滑滚动时，可按需 CDN 引入 GSAP（ScrollTrigger / ScrollSmoother / SplitText，3.13 起全部免费）或 Lenis。软件 / App / 组件三类页面没有页面级滚动，一律不用平滑滚动。
- 技术栈锁定原生 HTML/CSS/JS + 零构建的 CDN 轻量库（GSAP / Lenis / Alpine.js）。即使参考其他前端设计技能（frontend-design 等），也不要引入 React / Vue / Tailwind / Next 这类需要构建的依赖。

页面生成的详细规则以 `skills/mono-ui-prototype/SKILL.md` 为准 —— 生成页面前必读该文件并完整走一遍其流程，且必须先执行本文件开头的「第一优先级：设计原型必读两份文档 + 完成后回归检查」。提交或推送前的截图更新以本文件「第二优先级」一节为准，任何技能中的「不截图」描述都不得覆盖它；但它不免除第一优先级的必读与回归检查义务。
