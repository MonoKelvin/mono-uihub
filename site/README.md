# mono-uihub 原型画廊（site/）

展示 `ui/` 下全部 UI 原型的静态网站。Astro 构建，GSAP 动效，浅色主题，中英文切换。原型本身仍是零构建的原生页面，本目录不改动它们。

## 本地开发

```bash
cd site
npm ci
npm run dev        # 同步原型 → 启动 Astro 开发服务
npm run build      # 同步原型 → 输出 dist/
npm run preview
npm test           # 元数据、详情导航、背景配色与发布规则测试
npm run test:background # 无截图的背景 DOM / 生命周期测试（需要本机浏览器）
```

安装（`npm install` / `npm ci`）、`dev` 和 `build` 会先执行 `skills/setup-skills.mjs`，在仓库根目录生成被 Git 忽略的 `.claude/skills`。优先使用相对符号链接，Windows 无权限时改用本机目录联接；移动仓库后重跑即可。只需加载技能时，可在根目录执行 `node skills/setup-skills.mjs`。

`scripts/sync-prototypes.mjs` 会把 `ui/<slug>/` 中的 html / css / js / 图片 / 字体 / 截图复制到 `public/prototypes/`（已 gitignore），**不发布 metadata.json** 和任何隐藏文件。

## 数据规则

数据来源：`site/lib/catalog.mjs`，构建时读取。

| 功能 | 依据 |
| --- | --- |
| 搜索 | 首条生成记录的 prompt + 模型 + 类型 / 标签 / 配色 |
| 模型筛选 | 首条记录 `model`（统一小写） |
| 类型 / 标签 | 类型：首条记录的显式字段，缺失时回退根级 `page_type`；标签：首条记录的显式字段，没有时从首条提示词提取 |
| 配色 | 根级 `palette`（`#rrggbb` 列表），构建期按 OKLCh 距离归入 `lib/colors.mjs` 的 30 个命名色系 |
| 排序 | 根级 `updated_at`（默认，最新在前）、根级 `created_at`、名称 |
| 卡片标题 | 根级 `name`，仅展示 |

- 首条记录 = `history[0]`，兼容旧结构 `generation.history[0]`。后续修改记录一律不参与。
- 根级 `tags` 会随修改被重写，所以不参与筛选。
- 没有 metadata.json 的原型显示「未记录」，不编造信息。
- 数据是构建时快照：新增原型或改元数据后需要重新构建 / 部署。
- 关键词表（标签、类型）在 `catalog.mjs` 顶部，按需扩充；配色色系表在 `lib/colors.mjs`。

## 详情展示

- 点击卡片在当前标签进入 `#prototype=<slug>` 详情；该链接可以直接打开或刷新。主页 DOM 不卸载，返回后保留搜索、筛选、排序、语言、面板和滚动位置。
- 左侧 iframe 原样加载 `/prototypes/<slug>/index.html`，不把原型的 CSS/JS 注入画廊。嵌入时去除根滚动条槽，并通过右边缘探测定位内部容器实际的滚动条占位；测量先扣除边框，不裁内容、不强行拉宽 iframe。网页仍可滚动，其他面板保留原样。右侧参数抽屉默认打开，窄屏为覆盖式抽屉。
- 参数开关位于右侧面板上方，使用 `layout-sidebar-right` 图标，与面板右边缘对齐，不随原型宽度变化而移动。顶部胶囊工具条始终相对整个详情视口居中，与返回和参数开关的图标水平对齐，不随抽屉或原型工作区宽度移动，包含独立打开、纯净全屏、上一个、下一个；全屏时只保留原型及恢复按钮，不重载 iframe。
- 上下一个遵循当前筛选后的网格排序，首尾禁用，不循环。只在预览内部交叉淡化 UI、更新参数，不执行画廊退场再入场，外壳、面板开合和全屏状态保持不变。新原型就绪前保留当前 UI 与参数，失败保留原对象和链接并支持重试；加载判定共用 `src/scripts/prototype-frame.js`。不堆叠历史，返回仍一次回到原画廊并保留滚动、筛选和排序。
- 详情按顺序展示：提示词、大模型、页面类型、参考来源、生成耗时、对话轮次、图片参数、创建/修改时间。参数抽屉不再显示顶部标题和分隔线，桌面宽度为 280–332px；底部仅保留安全边距，扩大主要预览区。提示词、模型、图片参数及耗时仍只取首次 UI 生成记录；后续记录仅计数。缺失项整项省略，提示词和图片提示词各有复制按钮，原始 metadata.json 不公开。
- 入场截图保持卡片同样的 cover 裁剪、边框及 hover 放大，不拉伸像素；先展开至原型工作区，等页面就绪后再淡出。退出保持真实页面缩回，不切换成截图；未加载时保留当前加载画面。过渡期间锁定主页滚动并暂停会改变卡片位置的操作，动画不等待网络。超过 12 秒提示耗时较长，失败可重试。
- 详情背景由 `prototype-background.js` 识别外层 `html / body / stage / canvas / desk / backdrop`，只分离明确的背景边界，窗口本体及内部伪元素保持原样。普通全出血网页、透明场景和无法安全区分的背景回退画廊默认背景；Canvas / WebGL / 视频装饰（含后代）不抽离。
- `prototype-backdrop.js` 用不允许脚本的 `sandbox="allow-same-origin"` iframe 重放外层颜色、渐变、图片、伪元素和装饰 DOM。样式链接、根属性、CSS 变量和结构占位保留，脚本、事件、嵌套页、自动聚焦、表单提交及不必要的内容资源移除，并添加受限 CSP。资源 base 使用原型 URL，相对 CSS / SVG / 字体路径保持正确。
- 只有背景重放就绪后才透明化前景的已确认外层背景。背景以原预览的逻辑视口进行统一 cover 放大、居中铺满详情；不把前景 iframe 扩成全屏，不修改原型的 margin / padding / position / 尺寸，展示区壳层透明且无自身阴影。抽屉和全屏仍沿用现有工作区布局，视口变化时重新识别背景并计算 cover。
- 软件 / App / 组件的预览壳层允许阴影溢出。iframe 自身仍有浏览器绘制边界，所以 `prototype-shadow.js` 在详情层按外层窗口的真实位置、圆角和外侧 `box-shadow` 完整绘制阴影，不再沿 iframe 底边裁切拼接；确认源背景透明后，原窗口只保留内阴影，避免阴影叠深和底部接缝。原型的内部 overflow、窗口尺寸和媒体查询保持不变。支持多层阴影与 2D 缩放/旋转，内阴影、内部组件、网页和无法可靠映射的 3D / clip-path 不补绘。主题和尺寸变化合并更新，阴影随原型一起淡化并在卸载后清理。
- 背景和配色随当前原型一起提交；预加载保留旧背景、UI 和参数，失败保留原型本身的背景，返回/取消清理重放和监听，迟到结果不覆盖当前页面。根/背景容器的主题属性、样式和尺寸变化合并更新，不逐帧扫描或重建。
- 详情配色优先取实际文字颜色与 `ink / text / muted / accent / surface / line` 语义变量，不使用元数据 palette 猜色。正文、辅助文字和强调色按 4.5:1 对比度选择；图片、复杂混合或跨度过大的渐变无法保证可读时使用协调的安全面板/控件表面。颜色仅写入详情根节点的局部变量，不修改主页或原型内颜色。
- 动效使用原生 WAAPI 和 CSS，提供 reduced-motion 的短淡化版本。实现位于 `src/components/PrototypeDetail.astro`、`src/scripts/prototype-detail.js`、`src/styles/prototype-detail.css`。
- `/embed/` 也使用同一详情，在嵌入画廊自身的视口内展示，不接管外部父站；详情期间暂停高度上报，返回后恢复。

背景测试分两层：`npm test` 保留现有回归并验证边界判断、颜色和 cover 算法；`npm run test:background` 用现有 Playwright 在内存中提供合成 HTML/CSS/JS，验证真实 DOM 的重放安全、透明层恢复、主题变化和详情切换/重试/取消，不启动网站服务、不截图、不读取本地图片。Windows 默认使用本机 Edge，其它平台使用已安装的 Chromium，可用 `PLAYWRIGHT_CHANNEL` 指定浏览器；没有安装浏览器时需要先手动准备。合成 DOM 测试不等于实际原型的视觉验收或完整识别率验证。

## Tooltip 机制

控件只设置 `aria-label`，不需要额外 tooltip 属性或组件：

```html
<button aria-label="复制提示词"><i class="ti ti-copy" aria-hidden="true"></i></button>
```

`src/scripts/tooltip.js` 统一处理事件委托、定位、延迟、动态标签及原生 `title` 接管，所有提示共用一个全局层。统一修改 `theme.css` 中 `.site-tooltip` 即可替换整站样式。区域、导航和 iframe 的可访问名称不变成覆盖整个区域的提示。原型 iframe 内的业务 UI 保持自己的交互，不接管其 tooltip。

## 截图工具

```bash
# 仓库根目录或 site/ 下均可（site 下用 npm run screenshots -- ...）
node tools/screenshots/capture.mjs --all
node tools/screenshots/capture.mjs --slug spidey-watch --overwrite
node tools/screenshots/capture.mjs --all --width 1600 --height 1000 --count 3
```

- 输出 `ui/<slug>/screenshots/1.jpg`、`2.jpg`…（`--count N` 截 N 张）；已存在的文件默认保留，`--overwrite` 覆盖。
- 默认 1600×1000（8:5），与卡片比例一致。软件类原型多以 900px 高度为紧凑布局断点，低于该高度会折叠面板，所以视口不宜过小。
- 优先用本机 Edge；没有时运行 `npx playwright install chromium`。
- 手动截图同样按 `1.jpg`、`2.jpg` 命名放入该目录即可，多张时卡片悬停会轮播。

## 主题

所有颜色、阴影、圆角、字体都是 `src/styles/theme.css` 中 `:root` 的 CSS 变量。新增主题只需写一个覆盖块，并改 `<html data-theme>`：

```css
[data-theme="light"] { --paper:#faf7f4; --ink:#1a1816; --ink-2:#6b665f; --gold:#5a8c6e; /* … */ color-scheme: light; }
```

## 部署到 Vercel

1. Vercel 导入 `MonoKelvin/mono-uihub` 仓库。
2. **Root Directory** 设为 `site`；保持 *Include source files outside of the Root Directory* 开启（默认开启，构建需要读取 `../ui`）。
3. 框架、构建命令、输出目录由 `site/vercel.json` 指定（astro / `npm run build` / `dist`）。Node 版本选 22 及以上。
4. 之后每次推送自动重新构建。

## 内嵌到 monokelvin.cn/projects

结论：**可行，但需要修改个人站三处**，本仓库已备好嵌入端。

嵌入端（本仓库，已完成）：
- `/embed/` 路由：去掉顶部横幅、首屏标题和页脚，只保留筛选栏和网格。
- 参数：`?lang=en|zh`；`?parent=https://monokelvin.cn` 时把内容高度通过 `postMessage({type:'mono-uihub:resize', height})` 发给父页，只发往白名单域名。
- `vercel.json` 给 `/embed/` 设置 `frame-ancestors 'self' https://monokelvin.cn https://www.monokelvin.cn`。

个人站需要改（本次未改动 monokelvin.studio）：
1. **CSP**：`next.config.ts` 的 `default-src 'self'` 会拦截外部 iframe，需加 `frame-src https://<画廊域名>`。父页自身的 `frame-ancestors 'none'` / `X-Frame-Options: DENY` 无需改动（它们只限制别人嵌入个人站）。
2. **滚动接管**：`src/modules/projects/ProjectsExperience.tsx` 在桌面端用 GSAP Observer 监听 `window` 滚轮并 `preventDefault`，一次滚动翻一整屏，还拦截方向键。长网格放进去会无法正常滚动。做法：把画廊作为最后一屏之后的普通区块，滚到该区域时 `observer.disable()`、恢复原生滚动，离开时再启用；或在画廊区域内跳过 Observer 和键盘处理。
3. **接入组件**：参考 `integration/StudioGallery.tsx.example`，校验 `event.origin` 和 `event.source`、限制高度范围，iframe 自适应高度；同时提供「新标签页打开」链接作兜底。

如果不想改个人站的滚动逻辑，直接在项目页放一张链接卡片指向独立站，是最省事的方案。
