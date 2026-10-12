# mono-uihub

一个持续生长的高保真 UI 原型仓库。每个页面都是独立完整的前端原型：纯 HTML / CSS / 原生 JS，无构建、无框架，用于探索视觉方向、交互细节与界面质感。

[English](README.md)

## 目录结构

```
mono-uihub/
├── ui/                        # UI 原型，一个页面一个文件夹
│   ├── keyboard-configurator/ # 机械键盘在线定制页（外壳 / 轴体 / 键帽）
│   └── im-desktop-chat/       # 桌面端即时聊天窗口
├── skills/                    # 生成这些页面的 Agent 技能
│   └── SKILL.md
└── LICENSE                    # MIT
```

## 页面一览

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 键盘定制工坊 | `ui/keyboard-configurator/index.html` | 虚构键盘品牌的在线配置页：选外壳、轴体、键帽，实时预览整机效果，附轴体参数条与价格汇总，整体包装成一张机械制图工作台。 |
| 桌面即时聊天 | `ui/im-desktop-chat/index.html` | 桌面端 IM 聊天界面原型。 |

## 使用方式

无需安装、无需构建，直接用浏览器打开任意 `index.html` 即可。

```bash
# 可选：本地起个静态服务
npx serve .
# 或者直接双击
ui/keyboard-configurator/index.html
```

所有数据均为本地假数据；选择、购物车、轻提示、视图切换等交互用最简原生 JS 接上，便于演示，没有真实后端。

## 背后的技能

[`skills/SKILL.md`](skills/SKILL.md) 记录了本仓库每个页面的生成方法论：每次都从页面内容现场推导一套全新的视觉方向（配色、字体、布局、动效），规避模板化的"AI 味"，产出可交互的高保真原型。

## 开源协议

[MIT](LICENSE)
