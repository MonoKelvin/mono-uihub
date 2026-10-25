# mono-uihub

AI 驱动的 UI 原型设计库。一句话生成设计页面，为设计师与开发者提供源源不断的灵感。

[English](README.md)

## 目录结构

```
mono-uihub/
├── ui/                        # UI 原型，一个页面一个文件夹
│   └── ...                    # 页面持续增加
├── skills/                    # 背后的生成技能
│   ├── mono-ui-prototype/     # 页面生成技能
│   │   └── SKILL.md
│   └── image-purify/          # 干净出图词表（去噪点 / 去鳞片感 / 去 AI 味）
│       ├── SKILL.md
│       └── purify.json        # 唯一词源，生图工具直接读取
├── tools/                     # 给助手用的脚本
│   ├── image-forge/           # 按需生成透明 PNG（提示词自动叠加干净词）
│   └── resource-getter/       # 免费插画 / 抠图 PNG / 摄影，按延迟自动热链或下载
├── LICENSE                    # MIT
└── README.md / README.zh.md
```

## 工作方式

用一句话描述一个页面，比如"一个机械键盘的在线定制页""一个桌面端聊天窗口"。[`skills/SKILL.md`](skills/SKILL.md) 中定义的技能会把它变成一份完整的高保真原型：

- **每次都推导全新的视觉方向**：配色、字体、布局、动效都从页面内容与受众现场推导，绝不套用固定模板，也不复用上一个页面的风格。
- **纯前端，零配置**：每个页面都是独立的 HTML / CSS / 原生 JS，无构建、无框架、无依赖。
- **可交互，不是死壳**：能点的元素都用最简 JS 接上本地假数据，拿来即可演示。
- **自带"去 AI 味"检查**：交付前按硬性清单自检，一个强调色、一套圆角、真实文案、刻意的留白。
- **生成的图也要干净**：页面需要定制素材时，[`skills/image-purify`](skills/image-purify/SKILL.md) 的干净词会在生图前自动叠加，避免噪点、鳞片感、满屏碎片这类一眼 AI 的脏图。
- **优先抠图素材**：[`tools/resource-getter`](tools/resource-getter/README.md) 负责取透明 SVG 插画（unDraw / Storyset）、抠图 PNG（Pixabay / pngimg）与摄影，自动去掉 SVG 的满幅背景；探测到源站太慢时改为下载，不再硬挂远程链接。

## 使用方式

浏览 `ui/` 目录，用浏览器打开任意 `index.html` 即可。

```bash
# 可选：本地起个静态服务
npx serve .
```

想生成新页面，把技能交给你的编码助手，附上一句话描述即可。

## 开源协议

[MIT](LICENSE)
