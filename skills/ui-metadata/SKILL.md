---
name: ui-metadata
description: 为 UI 原型创建、整理和更新 metadata.json，记录页面基础信息、生成历史与生图调用统计。
---

# UI 原型生成元数据 v2

## 简化结构

删除冗余字段：`schema_version`、`generation`（历史统一放在根级 `history`）、`token_usage`、`reasoning_effort`、`started_at` / `completed_at`、`round` / `kind`、`notes`。保留紧凑、实用字段，字段结构以 `template.json` 为准。

| 字段 | 保存什么 |
| --- | --- |
| `name` | 页面名称 |
| `slug` | 实际目录名 |
| `page_type` | `software` / `website` / `app` / `component` |
| `tags` | 3 个左右的领域 / 功能标签，其中 1-2 个可写标志性特点 |
| `palette` | 页面主配色 1-3 个，小写 `#rrggbb` 十六进制列表 |
| `created_at` | 最初创建时间，`yyyy-MM-dd HH:mm:ss` |
| `updated_at` | 最近更新时间，`yyyy-MM-dd HH:mm:ss` |
| `history` | 生成与修改历史，每条含 `prompt` / `model` / `skills` / `duration_seconds` / `image_generation` |

### tags 书写约定

- 主体用**通用、可复用**的领域词或功能词，比如 `农业`、`数据可视化`、`地图`、`定制`、`筛选`、`工作流`；同一类词尽量跨项目复用，方便画廊按标签聚合。
- 可以再加 **1-2 个标志性标签**，用来快速区分这页的独特性格，例如 `明日方舟`、`蜘蛛侠`、`蜂场`、`超跑`；标志性标签宁少勿滥，能一眼区分即可。
- **不要写**过细的实现或视觉描述：具体配色、材质、工艺、单一控件的细节（如「天空蓝」「黑钛」「莫兰迪高级灰」）不放进 tags。
- 页面容器类型已经由 `page_type` 表达，tags 不再重复 `软件` / `组件` / `网站` 这类词。
- 数量控制在 3 个左右：领域、核心功能、标志性特点，能代表这个界面就够了。

### palette 书写约定

- 从本页 `styles.css` 的 `:root` 颜色变量中取 1-3 个**主配色**，按「主底色 → 强调色 → 墨色 / 第二主色」排序，例如 `["#f5f3ec", "#3e6b4f", "#23281f"]`。
- 只写小写 `#rrggbb`：不写 `rgba()` / `hsl()` / 三位缩写 / 带透明度的八位值；hover、soft、line、shadow 等派生色不收录。
- **每次生成或修改界面后同步更新**：配色有变化就改写 `palette`，保持与当前 `styles.css` 一致（它描述的是最新界面，不随 `history` 追加）。
- 画廊在构建期把每个颜色归入固定的命名色系（如米白、墨黑、苔绿、钴蓝，见 `site/lib/colors.mjs`），用于「配色」筛选；不要在 `tags` 里重复写颜色。

`history` 数组按顺序排列，第一条为初始生成，其后每条为一次 revision，轮次顺序即索引 + 1。初始生成信息无法确定时，`history` 可以留空数组，不要编造提示词、模型或耗时。没有内容的字段直接省略，不要用 `null` 占位。

`history[].image_generation` 是列表，每项只记录生成该图片所用的 `prompt` 与 `model`；没用到 AI 生图就不写这个字段，不要写 `{ used: false }` 之类的空对象。

**技能列表记录约定**：`metadata.json` 中的所有 `skills` 数组（如 `history[].skills`）均不记录 `ui-metadata`。该技能仍用于元数据归档，但即使本轮实际使用，也不要将其加入技能列表；生成或更新元数据时，过滤已有列表中的 `ui-metadata`，保留其他技能。

## 工作流程

1. **生成前后**：创建或更新 `ui/<page>/metadata.json`，仅记录当前这轮。
2. **历史追加**：每次修改追加一条 `history` 条目，不覆盖。
3. **JSON 校验**：标准 JSON 解析通过。

> **注意**：`mono-ui-prototype` 中的「不截图」约定是为了防止 AI 在生成后启动浏览器截图用于测试、验证检查等目的。而 `ui-metadata` 的「展示截图」是独立的，用途仅在画廊中预览当前最新的界面成果，每次代码修改后必须执行截图到 `ui/<slug>/screenshots/` 目录，不记录在 `metadata.json` 中，与「不截图验证」约定不冲突。

## 模板

```json
{
  "name": null,
  "slug": null,
  "page_type": null,
  "palette": [],
  "tags": [],
  "created_at": null,
  "updated_at": null,
  "history": [
    {
      "prompt": null,
      "model": null,
      "skills": [],
      "duration_seconds": null,
      "image_generation": [
        {
          "prompt": null,
          "model": null
        }
      ]
    }
  ]
}
```
