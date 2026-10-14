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

`generation.history` 数组按顺序排列，第一条为初始生成，其后每条为一次 revision，轮次顺序即索引 + 1。

## 工作流程

1. **生成前后**：创建或更新 `ui/<page>/metadata.json`，仅记录当前这轮。
2. **历史追加**：每次修改追加一条 `history` 条目，不覆盖。
3. **JSON 校验**：标准 JSON 解析通过。

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
