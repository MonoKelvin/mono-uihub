# resource-getter

为 UI 原型获取**免费图片 / 矢量插画 / 抠图 PNG**，并自动决定「在线热链」还是「下载到 `ui/<page>/assets`」。

一个来源一个文件；共享逻辑（HTTP、robots、探测、下载、SVG 去底、MCP）在 `lib/`。搜索/下载**零第三方运行时依赖**，Python 3.10+ 标准库即可运行；只有 `pixiv-login` 会通过 `uv` 临时安装 `requests` 来运行上游取 token 脚本。

```
tools/resource-getter/
├── get.py                # CLI 入口
├── sources/              # 12 个来源，各一个文件，改站点只改对应文件
├── lib/                  # 通用能力
├── vendor/               # 引用式三方源码（gitignored，仅 manifest/README 入库）
├── test-output/          # test 子命令的样本（gitignored）
├── .env.example          # 凭据模板（真实 .env 已 gitignore）
└── THIRD_PARTY.md        # 许可与第三方代码说明
```

## 快速开始

```bash
# 1. 凭据（只需 Pixabay 就能覆盖大部分日常）
cp tools/resource-getter/.env.example tools/resource-getter/.env
#    填入 PIXABAY_API_KEY=...

# 2. 自检
python tools/resource-getter/get.py doctor
python tools/resource-getter/get.py doctor --net      # 额外测各来源连通性

# 3. 搜索
python tools/resource-getter/get.py search undraw "developer" --limit 5
python tools/resource-getter/get.py search pixabay "fox" --type illustration --transparent
python tools/resource-getter/get.py search pngimg "fox"
python tools/resource-getter/get.py search storyset "developer" --style rafiki

# 4. 取用（auto：快则热链，慢则下载）
python tools/resource-getter/get.py get undraw "donut chart" --page my-page
python tools/resource-getter/get.py get pixabay "fox" --type illustration --transparent --page my-page
```

`get` 会打印一段可直接粘进原型的 `<img>`：

```html
<img src="./assets/undraw-donut.svg" alt="Donut Chart" loading="lazy" />
```

## Pixiv Refresh Token

Pixiv 搜索/下载走官方 App API，需要 `PIXIV_REFRESH_TOKEN`。resource-getter 不内嵌登录逻辑，而是以**引用式 vendor** 接入上游 [pixiv-mcp-server](https://github.com/222wcnm/pixiv-mcp-server)：

- `vendor/pixiv-mcp-server/` 是本地 clone，已被 gitignore，源码**不上传**；
- `vendor/manifest.json` 锁定 repo 与 commit（当前 `c02e5e6`，MIT）；
- `pixiv-login` 自动 clone / update，并通过 `uv run --no-project --with requests` 运行上游 `get_token.py`，不往 vendor 里装环境。

```bash
python tools/resource-getter/get.py pixiv-login --fetch-only   # 只拉取/更新源码
python tools/resource-getter/get.py pixiv-login                # 浏览器登录，写入 .env
python tools/resource-getter/get.py pixiv-login --verify       # 登录写入后验证
python tools/resource-getter/get.py pixiv-login --verify-only  # 只验证已有 token，不再登录
```

上游脚本是交互式的：它会打开 Pixiv 登录页，要求你在 DevTools 的 Network 面板复制 `callback?...` 的完整 URL 粘贴回来。成功后**只更新** `.env` 的 `PIXIV_REFRESH_TOKEN`，不会覆盖 Pixabay 等已有配置。

> 这是唯一需要三方源码的环节；token 到手后，搜索/下载仍由 `sources/pixiv.py` 直连官方 API，vendor 只在登录时用到。若你更想用 submodule，见 `vendor/README.md` 的转换步骤。

## 来源矩阵

| 来源 | 类型 | 产出 | 透明底 | 许可 / 商用 | 凭据 |
| --- | --- | --- | --- | --- | --- |
| **unDraw** | 爬虫 + CDN | SVG 插画 | 是（自动去满幅底） | 免费商用，无需署名；禁止打包转售 / 训练模型 | — |
| **Pixabay** | 官方 API | 照片 / 插画 / 矢量 | 部分（透明 PNG） | Pixabay Content License，可商用，无需署名 | `PIXABAY_API_KEY` |
| **pngimg** | 爬虫 | 抠图 PNG | 是 | **CC BY-NC 4.0：禁止商用，需署名** | — |
| **Storyset** | 远程 MCP | SVG 插画 | 是 | 免费商用但**需署名** Storyset / Freepik | — |
| **Doodle Ipsum** | URL 拼接 | PNG 插画 | 是（`bg=transparent`） | Blush License，可商用，无需署名 | — |
| **Pixiv** | 官方 App API | 插画 | 否 | **作者版权，仅限私人参考** | `PIXIV_REFRESH_TOKEN`（`pixiv-login`） |
| Picsum | URL / 列表 | 摄影 | 否 | Unsplash License | — |
| Unsplash | CDN / 搜索 | 摄影 | 否 | Unsplash License | 可选 `UNSPLASH_ACCESS_KEY` |
| Pexels | CDN / 搜索 | 摄影 | 否 | Pexels License | 可选 `PEXELS_API_KEY` |
| DiceBear | URL 拼接 | 头像 / 抽象 SVG | 是 | 代码 MIT；每个风格 CC0 / CC BY | — |
| placehold.co | URL 拼接 | 纯色占位 | 否 | 免费占位服务 | — |
| Pravatar | URL 拼接 | 头像占位 | 否 | 来源授权不明确，仅原型 | — |

**默认优先级**：透明矢量插画（unDraw / Storyset / DiceBear / Doodle）→ 抠图 PNG（Pixabay / pngimg）→ 摄影（Pixabay / Picsum / Unsplash / Pexels）→ 手绘 SVG → AI 生图。

## 命令

### `search <source> <query>`

只列候选，不下载。常用参数：

```bash
--limit 12                  # 数量
--type illustration         # Pixabay: all / photo / illustration / vector
--transparent               # 只要透明底 / 抠图资源
--style rafiki              # Storyset: amico / bro / cuate / pana / rafiki
--probe                     # 对每条结果实测 TTFB，决定是否值得热链
--json                      # 机器可读
```

### `get <source> <target>`

`target` 可以是关键词，也可以是 `http(s)` 直链。

```bash
# 自动：TTFB ≤ 0.9s 且读取 ≤ 2.5s → 热链；否则下载
python tools/resource-getter/get.py get undraw "donut chart" --page my-page

# 强制下载（慢站 / 需要离线交付）
python tools/resource-getter/get.py get storyset "developer" --page my-page --mode download

# 强制热链
python tools/resource-getter/get.py get pixabay "fox" --page my-page --mode hotlink

# 直接给 URL
python tools/resource-getter/get.py get pngimg "https://pngimg.com/uploads/fox/fox_PNG23172.png" --page my-page

# 选第 3 条结果，指定文件名，覆盖旧文件
python tools/resource-getter/get.py get undraw "chart" --pick 3 --name chart --page my-page --force
```

输出位置二选一：

- `--page <name>` → `ui/<name>/assets/`，自动生成 `./assets/xxx` 片段；
- `--out <dir|file>` → 任意目录或完整文件路径。

### `url <source>`

纯 URL 型来源不需要搜索：

```bash
python tools/resource-getter/get.py url doodleipsum --width 700 --height 1244 --style avatar --page my-page
python tools/resource-getter/get.py url dicebear --style shapes --seed mono --page my-page
python tools/resource-getter/get.py url placehold --width 600 --height 400 --text "Hello" --mode hotlink
python tools/resource-getter/get.py url picsum --width 1200 --height 800 --seed lab --mode hotlink
python tools/resource-getter/get.py url unsplash --id photo-1500530855697-b586d89ba3ee --mode hotlink
python tools/resource-getter/get.py url pexels --id 104827 --mode hotlink
```

### `probe <url>...`

单独测延迟，不改任何文件：

```bash
python tools/resource-getter/get.py probe https://cdn.undraw.co/illustration/donut-chart_1ike.svg
```

### `test`

逐个来源抓样本，验证「搜索/构造 → resolve → 下载 → 格式识别」整条链路。

```bash
python tools/resource-getter/get.py test                  # 从随机词池抽一个词
python tools/resource-getter/get.py test --query "cat"    # 手动关键词
python tools/resource-getter/get.py test --pool "cat,anime,room,work" --seed 7
python tools/resource-getter/get.py test --limit 3 --out temp/rg-test
```

- 默认随机池：`cat`（猫）/ `anime`（动漫）/ `room`（房间）/ `work`（工作）/ `illustration`（插画）/ `developer` / `coffee` / `plant` / `city` / `music` / `travel` / `fox` / `dog` / `food` / `nature` / `robot`。
- 检索语言以英文为主（unDraw / Storyset / pngimg 对中文关键词支持有限）；某个来源没有匹配结果记 `skipped`，不算失败。
- 每个来源默认最多 **2** 张，输出到 `tools/resource-getter/test-output/`；文件名就是来源名：`pixabay.png`、`pixabay-2.png`、`undraw.svg`……目录已 gitignore。
- 缺凭据的来源（如 Pixiv 未配置 token）标记 `skipped`，不算失败；随机词无结果时 unDraw / Storyset / pngimg 会回退到已知可用词，手动 `--query` **不**回退，失败如实报告。
- 退出码：存在 `failed` 时为 `1`，否则 `0`；`--json` 输出结构化结果。

### `convert`

批量将目录下的 JPG/PNG/GIF 转为 WebP，遵循单副本策略（同主名其它格式会被删除）：

```bash
python tools/resource-getter/get.py convert ui/my-page/assets
python tools/resource-getter/get.py convert ui/my-page/assets --force-webp       # 强制全部转
python tools/resource-getter/get.py convert ui/my-page/assets --threshold 80     # ≤80KB 原图保留
python tools/resource-getter/get.py convert ui/my-page/assets --quality 90
python tools/resource-getter/get.py convert ui/my-page/assets --dry-run --json
```

- **依赖**：Pillow 是可选的。未安装时 `convert` 会跳过转换并保留原格式，`get` 下载链路的 `--webp` 也会静默降级。
- **阈值**：`--threshold KB` 控制「很小的图片保留原格式」；GIF 动画默认保留原样（WebP 静态丢失动画帧）。
- **环境变量**：`RG_WEBP_THRESHOLD` 可覆盖默认阈值（默认 64KB）。
- **单副本**：转换后同主名的 `.jpg/.jpeg/.png/.gif` 会被删除，只留 `.webp`。

也可以在下载时直接转 WebP：

```bash
python tools/resource-getter/get.py get pixabay "fox" --page my-page --webp
```

```bash
python tools/resource-getter/get.py list
python tools/resource-getter/get.py doctor --net
```

## 透明底与「不要方框」

两条路径，按资源类型自动处理：

**SVG（unDraw / Storyset / DiceBear）**

- `lib/svg.py::strip_background` 会移除绘制顺序最前面的**满幅背景**（`rect` 或覆盖整个 viewBox 的 `path`），最多移除两层（`rect + path` 叠放很常见）。
- 判定是保守的：算不出覆盖 ≥ 97% viewBox 就原样保留，避免误删画面里的整块色板。
- 默认对「SVG 且标记为透明」的资源开启；`--no-strip-bg` 可关闭，`--strip-bg` 可强制开启。
- unDraw 主色是 `#6c63ff`，`--recolor '#c8a24a'` 直接换主色；其他来源用 `--from-color '#xxxxxx' --recolor '#yyyyyy'`。

**PNG（Pixabay / pngimg / Doodle）**

- 下载后读 IHDR 的 colour type：4 / 6 表示有 alpha 通道。
- Pixabay 的 `--transparent` 先按 `transparent` 标签过滤；没有标签命中时，对前 8 条候选只取 64 字节做远程 IHDR 检查，避免把白底 JPEG 拉下来。
- pngimg 本身就是抠图 PNG；Doodle 用 `bg=transparent`。

## 延迟判定

```text
TTFB ≤ 0.9s 且 读取（最多 256KB）≤ 2.5s  →  hotlink
否则                                      →  download
```

- 阈值可用 `--max-ttfb` / `--max-total` 调整。
- `probe` 用 `Range: bytes=0-262143` 只读前缀；CDN 不支持 Range 时会退化为截断读取，不影响 TTFB 判断。
- 慢站下载是**硬要求**：`--mode download` 在没有 `--page` / `--out` 时直接报错，不会静默生成一个会拖慢页面的远程链接。
- `doodleipsum` 的裸 URL 每次刷新都会换图；`resolve` 会跟随一次 307 并缓存 `?i=<imageId>` 的静态地址，热链才可复现。

## 合规与许可

- **只爬允许爬的页面**：`lib/robots.py` 读取并缓存 `robots.txt`，按最长匹配判断 `Allow/Disallow`，遵守 `Crawl-delay`；被禁止的路径直接报错，不绕过。
- **不伪装、不绕防护**：统一 UA 为 `resource-getter/1.0 (+repo)`；不处理 Cloudflare 挑战、不模拟登录、不抓付费内容。
- **限速**：unDraw 0.8s/请求，pngimg 1.0s/请求，Pixabay 0.65s/请求（对应 100 req/60s）。
- **Pixiv 走官方 OAuth refresh token**，不抓网页；作品版权归作者，默认 `safe` 过滤 R-18，下载文件仅作私人参考。
- **pngimg 是 CC BY-NC 4.0**：CLI 每次使用都会打印「禁止商用」警告。需要商用的原型请换 unDraw / Pixabay / Storyset（署名）/ Doodle。
- Storyset 免费版需要署名 `Illustration by Storyset`；去署名需要 Flaticon Premium。

## 维护

### 改一个来源

只改 `sources/<name>.py`。每个文件的 docstring 记录了：接口形态、实测到的端点、分页/限速、透明度处理、许可。

### 加一个来源

1. 新建 `sources/<name>.py`，至少提供 `NAME / TITLE / KIND / LICENSE` 和 `search()` 或 `build()`；
2. 在 `lib/registry.py` 的 `NAMES` 里加名字；
3. 跑 `python tools/resource-getter/get.py doctor` 与一次真实 `search` / `get`；
4. 在 README 的来源矩阵补一行，并在 `THIRD_PARTY.md` 记录许可。

最小接口：

```python
NAME = "example"
LICENSE = "..."
def search(query, *, limit=12, **_) -> list[Asset]: ...
def build(**opts) -> Asset: ...
def resolve(asset, **_) -> str: ...
def from_url(url) -> Asset: ...
```

### 共享模块

| 文件 | 职责 |
| --- | --- |
| `lib/http.py` | 统一 UA、gzip、重试、超时、按 host 限速、代理（读 `HTTPS_PROXY`） |
| `lib/robots.py` | robots.txt 解析 / 缓存 / 合规检查 |
| `lib/probe.py` | TTFB 与读取耗时，热链/下载判定 |
| `lib/download.py` | 原子写入、命名去重、SVG 后处理、WebP 转换（可选 Pillow） |
| `lib/webp.py` | JPG/PNG/GIF → WebP 转换，单副本维护，Pillow 可选 |
| `lib/svg.py` | 满幅背景移除、换色、脚本清理、主色统计 |
| `lib/raster.py` | PNG/JPEG/WebP/GIF/SVG 头部解析（尺寸、alpha） |
| `lib/mcp.py` | 最小 Streamable HTTP MCP 客户端（SSE + JSON-RPC） |
| `lib/cache.py` | TTL JSON 缓存（robots / Doodle 静态 URL / Pixiv token） |
| `lib/cli.py` | 子命令与输出 |

## 故障排查

| 现象 | 处理 |
| --- | --- |
| `HTTP 403` / `Just a moment...` | 站点在挡机房 IP。换网络/代理，或改用同内容的 API 来源；工具不绕 Cloudflare。 |
| Pixiv 刷新令牌失败 | `python tools/resource-getter/get.py pixiv-login` 重新取 token；国内网络在 `.env` 设 `HTTPS_PROXY`。 |
| Storyset MCP 403 | 确认 `STORYSET_MCP_URL` 可访问；服务端偶发限流，隔几秒重试。 |
| 下载很慢 / 超时 | 用 `probe` 确认；`--mode download` 落盘后由本地服务器提供，别再热链。 |
| SSL 证书错误 | 设置 `SSL_CERT_FILE` 指向公司根证书；不要关闭校验。 |
| Pixabay 429 | 已内置 0.65s 节流；仍触发说明并发调用，降低批量频率。 |
| 想复现某张 Doodle | 用 `get` 而不是 `url`；`resolve` 会把 `?i=` 静态地址写入 `.cache/doodle.json`。 |
