# Image Forge (`tools/image-forge/`)

A tiny, **zero-dependency** Python tool that generates PNG images with an
**alpha / transparent channel** via an OpenAI-compatible image-generation API
(`gpt-image-2`, `grok-imagine-2`, or any provider exposing the same
`/images/generations` shape).

It exists so the UI skill can mint custom transparent assets (icons, HUD
graphics, sci-fi line art, …) on demand — instead of hot-linking a search-result
photo whose background can't be removed and that doesn't match the page's visual
direction.

**Every prompt is purified before it is sent.** The clean-image word packs in
[`skills/image-purify/purify.json`](../../skills/image-purify/SKILL.md) are
appended automatically — universal base pack + the `--style` pack you pick + a
cutout pack when alpha is requested — which is what keeps output free of noise,
fish-scale micro-texture, floating debris and the usual "AI look". You write the
subject; the quality vocabulary is not yours to type.

## Setup

```bash
# 1. create the env file in the repo root (never committed)
#    → IMAGE_API_BASE_URL, IMAGE_API_KEY, IMAGE_MODEL

# 2. run (no pip / venv needed — stdlib only)
python tools/image-forge/generate.py --style lineicon \
  "a sci-fi HUD line icon, single cyan stroke" \
  ui/bioform-lab-console/assets/icon-hud.png
```

## Options

| arg / flag | description |
|---|---|
| prompt | **subject only** — no `ultra detailed` / `8k` / `masterpiece`; those words are what cause scaly, noisy output |
| output path | where to write the PNG (auto-creates dirs) |
| `--style <key>` | clean-image style pack. **Always pass one.** `photoreal` `anime` `chibi` `illustration` `skeuomorphic` `iso25d` `render3d` `cinematic` `stylized` `guofeng` `lineicon` `product` (aliases accepted, e.g. `3d`, `icon`, `2.5d`) |
| `--list-styles` | print the packs with their Chinese labels and aliases |
| `--dry-run` | assemble and print the final prompt without spending a request |
| `--no-transparent` | skip the `transparent: true` param and the cutout pack (use for full-bleed imagery or models without alpha) |
| `--no-purify` | send the raw prompt. A/B tests only — never for shipped assets |

## Environment

| var | required | meaning |
|---|---|---|
| `IMAGE_API_BASE_URL` | yes | e.g. `https://api.openai.com/v1` |
| `IMAGE_API_KEY` | yes | bearer token |
| `IMAGE_MODEL` | yes | e.g. `gpt-image-2` |
| `IMAGE_NEGATIVE_PARAM` | no | set `1` when the gateway accepts a `negative_prompt` field; otherwise the avoid-list is folded into the prompt text as an `Avoid: …` sentence |
| `PURIFY_PACK` | no | override the path to `purify.json` |

## How it works

1. Loads `.env` from the repo root (never committed).
2. Loads `skills/image-purify/purify.json` and assembles the final prompt:
   `subject → style pack → cutout pack (if alpha) → base pack → Avoid: …`.
   Prints a `[purify]` line so you can see what was applied; a missing pack file
   degrades to a small built-in base pack with a warning.
3. POSTs to `<IMAGE_API_BASE_URL>/images/generations`.
4. Prefers `b64_json` in the response; falls back to the `url` field.
5. **Transparency strategy**: first tries `transparent: true`. If that fails
   (model unsupported), retries once without it so generation still succeeds —
   the asset is usable; the designer can post-process in a few clicks if needed.
6. Writes the bytes to disk, correcting the extension if the model returned JPEG.

## Calling from the agent

The agent invokes the script directly — no MCP registration required:

```bash
! python tools/image-forge/generate.py --style <pack> "<subject>" ui/<page>/assets/<name>.png
```

See **素材：图片、图标与生成资产** in
[`skills/mono-ui-prototype/SKILL.md`](../../skills/mono-ui-prototype/SKILL.md)
for when generating is allowed at all (hot-linking comes first), and
[`skills/image-purify/SKILL.md`](../../skills/image-purify/SKILL.md) for the
prompt doctrine, the full word packs, and the img2img repair workflow for images
that are already dirty.
