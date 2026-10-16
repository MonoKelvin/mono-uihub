---
name: ui-metadata
description: 为 UI 原型创建、整理和更新 metadata.json，记录页面基础信息、生成历史与生图调用统计。
---

# UI 原型生成元数据 v2

## 简化结构

删除冗余字段：`schema_version`、`token_usage`、`reasoning_effort`、`started_at` / `completed_at`、`round` / `kind`。保留紧凑、实用字段。

| 字段 | 保存什么 |
| --- | --- |
| `name` | 页面名称 |
| `slug` | 实际目录名 |
| `page_type` | `software` / `website` / `app` / `component` |
| `tags` | 领域 / 主题 / 风格标签 |
| `created_at` | 最初创建时间 ISO 8601 |
| `updated_at` | 最近更新时间 ISO 8601 |
| `duration_seconds` | 本轮耗时 |
| `image_generation` | `{ used, count, models }` |
| `screenshots` | 界面截图列表 `{ file, description, captured_at }` |

`screenshots` 数组记录当前页面的**展示截图**（用于画廊缩略 / 卡片展示），与用于测试验证的截图不同。每次修改代码后，应重新执行截图并更新此列表。

`generation.history` 数组按顺序排列，第一条为初始生成，其后每条为一次 revision，轮次顺序即索引 + 1。

**技能列表记录约定**：`metadata.json` 中的所有 `skills` 数组（如 `history[].skills`）均不记录 `ui-metadata`。该技能仍用于元数据归档，但即使本轮实际使用，也不要将其加入技能列表；生成或更新元数据时，过滤已有列表中的 `ui-metadata`，保留其他技能。

## 工作流程

1. **生成前后**：创建或更新 `ui/<page>/metadata.json`，仅记录当前这轮。
2. **历史追加**：每次修改追加一条 `history` 条目，不覆盖。
3. **JSON 校验**：标准 JSON 解析通过。
4. **展示截图**：每次修改代码后，执行 `node tools/screenshots/capture.mjs --slug <slug> --overwrite` 重新生成界面截图到 `ui/<slug>/screenshots/`；工具会自动更新 `metadata.json` 中的 `screenshots` 列表，替换旧的截图条目。此截图仅用于画廊展示，**不用于测试验证**，与 `skills/mono-ui-prototype/SKILL.md` 中「默认不自行测试 / 不截图验证」的约定不冲突。

> **注意**：`mono-ui-prototype` 中的「不截图」约定是为了防止 AI 在生成后启动浏览器截图用于测试、验证检查等目的。而 `ui-metadata` 的「展示截图」是独立的，用途仅在画廊中预览当前最新的界面成果，每次代码修改后必须执行，以保证 `metadata.json` 的截图描述与实际界面保持一致。

## 模板

```json
{
  "name": null,
  "slug": null,
  "page_type": null,
  "tags": [],
  "created_at": null,
  "updated_at": null,
  "duration_seconds": null,
  "image_generation": { "used": false, "count": 0, "models": [] },
  "screenshots": [
    {
      "file": "screenshots/1.jpg",
      "description": null,
      "captured_at": null
    }
  ],
  "history": [
    {
      "prompt": null,
      "model": null,
      "skills": [],
      "duration_seconds": null,
      "image_generation": { "used": false, "count": 0, "models": [] }
    }
  ],
  "notes": []
}
```
