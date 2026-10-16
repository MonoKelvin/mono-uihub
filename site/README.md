# mono-uihub 原型画廊（site/）

展示 `ui/` 下全部 UI 原型的静态网站。Astro 构建，GSAP 动效，浅色主题，中英文切换。原型本身仍是零构建的原生页面，本目录不改动它们。

## 本地开发

```bash
cd site
npm ci
npm run dev        # 同步原型 → 启动 Astro 开发服务
npm run build      # 同步原型 → 输出 dist/
npm run preview
npm test           # 元数据规则、截图排序、发布白名单测试
```

`scripts/sync-prototypes.mjs` 会把 `ui/<slug>/` 中的 html / css / js / 图片 / 字体 / 截图复制到 `public/prototypes/`（已 gitignore），**不发布 metadata.json** 和任何隐藏文件。

## 数据规则

数据来源：`site/lib/catalog.mjs`，构建时读取。

| 功能 | 依据 |
| --- | --- |
| 搜索 | 首条生成记录的 prompt + 模型 + 类型 / 标签 / 配色 |
| 模型筛选 | 首条记录 `model`（统一小写） |
| 类型 / 标签 / 配色 | 首条记录的显式字段；没有时从**首条提示词**按关键词提取 |
| 排序 | 根级 `updated_at`（默认，最新在前）、根级 `created_at`、名称 |
| 卡片标题 | 根级 `name`，仅展示 |

- 首条记录 = `history[0]`，兼容旧结构 `generation.history[0]`。后续修改记录一律不参与。
- 根级 `tags` 会随修改被重写，所以不参与筛选。
- 没有 metadata.json 的原型显示「未记录」，不编造信息。
- 数据是构建时快照：新增原型或改元数据后需要重新构建 / 部署。
- 关键词表（标签、配色、类型）在 `catalog.mjs` 顶部，按需扩充。

## 截图工具

```bash
# 仓库根目录或 site/ 下均可（site 下用 npm run screenshots -- ...）
node tools/screenshots/capture.mjs --all
node tools/screenshots/capture.mjs --slug spidey-watch --overwrite
node tools/screenshots/capture.mjs --all --width 1600 --height 1200 --count 3
```

- 输出 `ui/<slug>/screenshots/1.jpg`、`2.jpg`…（`--count N` 截 N 张）；已存在的文件默认保留，`--overwrite` 覆盖。
- 默认 1600×1200（4:3），与卡片比例一致。软件类原型多以 900px 高度为紧凑布局断点，低于该高度会折叠面板，所以视口不宜过小。
- 优先用本机 Edge；没有时运行 `npx playwright install chromium`。
- 手动截图同样按 `1.jpg`、`2.jpg` 命名放入该目录即可，多张时卡片悬停会轮播。

## 主题

所有颜色、阴影、圆角、字体都是 `src/styles/theme.css` 中 `:root` 的 CSS 变量。新增主题只需写一个覆盖块，并改 `<html data-theme>`：

```css
[data-theme="dark"] { --bg:#141413; --surface:#1c1c1a; --ink:#f2f0ea; /* … */ color-scheme: dark; }
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
