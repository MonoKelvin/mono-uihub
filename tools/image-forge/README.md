# Image Forge (`tools/image-forge/`)

A tiny, **zero-dependency** Python tool that generates PNG images with an
**alpha / transparent channel** via an OpenAI-compatible image-generation API
(`gpt-image-2`, `grok-imagine-2`, or any provider exposing the same
`/images/generations` shape).

It exists so the UI skill can mint custom transparent assets (icons, HUD
graphics, sci-fi line art, …) on demand — instead of hot-linking a search-result
photo whose background can't be removed and that doesn't match the page's visual
direction.

## Setup

```bash
# 1. copy & edit the example
cp tools/image-forge/.env.example .env
# → fill in IMAGE_API_BASE_URL, IMAGE_API_KEY, IMAGE_MODEL

# 2. run (no pip / venv needed — stdlib only)
python tools/image-forge/generate.py \
  "a sci-fi HUD line icon, monochrome cyan, transparent background" \
  ui/bioform-lab-console/assets/icon-hud.png
```

## Options

| arg / flag | description |
|---|---|
| prompt | the only required prompt string |
| output path | where to write the PNG (auto-creates dirs) |
| `--no-transparent` | skip the `transparent: true` param (use when the model doesn't support it) |

## How it works

1. Loads `.env` from the repo root (never committed).
2. POSTs to `<IMAGE_API_BASE_URL>/images/generations`.
3. Prefers `b64_json` in the response; falls back to the `url` field.
4. **Transparency strategy**: first tries `transparent: true`. If that fails
   (model unsupported), retries once without it so generation still succeeds —
   the asset is usable; the designer can post-process in a few clicks if needed.
5. Writes raw PNG bytes to disk.

## Calling from the agent

The agent invokes the script directly — no MCP registration required:

```bash
! python tools/image-forge/generate.py "<prompt>" ui/<page>/assets/<name>.png
```

See the updated **素材** section in `skills/SKILL.md` for when to use this.
