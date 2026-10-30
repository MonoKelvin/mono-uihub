# Third-party code & content licenses

## Runtime code

**Nothing is committed as vendored source.** Everything under `lib/` and
`sources/` is written for this tool and uses only the Python standard library
(`urllib`, `json`, `html.parser`, `xml.etree`, `gzip`, `zlib`). No
`requirements.txt`, no `node_modules`, no build step.

The only third-party checkout is `vendor/pixiv-mcp-server/`, created on demand by
`get.py pixiv-login` for the one-time OAuth flow. It is gitignored and not
redistributed; see **Vendored by reference** below.

**Optional WebP conversion** (`lib/webp.py`, `convert` subcommand, `--webp` flag):
needs [Pillow](https://python-pillow.org/) (`pip install Pillow`). When Pillow
is absent the conversion steps are skipped and images are kept in their original
format — all other features continue to work with zero dependencies.

## External services / protocols

| What | Where | License / terms | How it is used |
| --- | --- | --- | --- |
| Storyset MCP server | `https://github.com/ba443/storyset-mcp` (MIT) | MIT (server code); illustrations under Storyset/Freepik terms | Remote Streamable-HTTP MCP endpoint, called with the minimal client in `lib/mcp.py`. No code copied. |
| Pixiv App API | `https://app-api.pixiv.net` | Pixiv terms; artwork © each artist | Official OAuth refresh-token flow. The public app `client_id` / `client_secret` / `hash_secret` constants are the same ones published by [pixivpy](https://github.com/upbit/pixivpy) (MIT); they are application identifiers, not user credentials. |
| Pixiv MCP server | `https://github.com/222wcnm/pixiv-mcp-server` | MIT (server code) | **Vendored by reference** into `vendor/pixiv-mcp-server/` (gitignored, not redistributed). Only `get_token.py` is used, via `get.py pixiv-login`, to obtain `PIXIV_REFRESH_TOKEN`. |
| Pixabay API | `https://pixabay.com/api/docs/` | Pixabay API terms + Content License | JSON REST, key in `.env`. |
| unDraw | `https://undraw.co` | unDraw license | Server-rendered search page + `cdn.undraw.co` SVG. |
| pngimg | `https://pngimg.com` | CC BY-NC 4.0 | Server-rendered search page; non-commercial only. |
| Storyset | `https://storyset.com` | Free with attribution; premium removes it | Assets served from `stories.freepiklabs.com`. |
| Doodle Ipsum / Blush | `https://doodleipsum.com` | Blush License | Generated PNG via URL; free commercial, no resale. |
| DiceBear | `https://www.dicebear.com` | Code MIT; styles CC0 / CC BY | Public SVG API. |
| Lorem Picsum | `https://picsum.photos` | Unsplash License | Public list API + CDN. |
| Unsplash | `https://unsplash.com` | Unsplash License | CDN hot-link; optional API search. |
| Pexels | `https://www.pexels.com` | Pexels License | CDN hot-link; optional API search. |
| placehold.co | `https://placehold.co` | Free placeholder service | URL only. |
| Pravatar | `https://i.pravatar.cc` | Unclear for production | Prototype-only; prefer DiceBear for shipped UI. |

## Content licenses (short form)

- **unDraw** — free for personal and commercial use, no attribution. Do not
  redistribute the illustrations as a pack, do not use them for model training,
  do not build a competing illustration service.
- **Pixabay** — Pixabay Content License: free commercial use, no attribution;
  do not redistribute the stand-alone asset.
- **pngimg** — CC BY-NC 4.0: **non-commercial only**, attribution required.
- **Storyset / Freepik** — free with credit (`Illustration by Storyset`);
  removing credit requires a Flaticon Premium subscription.
- **Doodle Ipsum / Blush** — free commercial use, no credit required; no resale
  or redistribution of the illustrations themselves.
- **Pixiv** — each artwork remains the copyright of its author. Treat downloads
  as private reference; public or commercial use needs the artist's permission.
- **Picsum / Unsplash / Pexels** — free commercial use under their respective
  licenses; do not sell unmodified copies.
- **DiceBear** — generator MIT; each avatar style has its own license (mostly
  CC0 1.0 or CC BY 4.0). Check the style page before shipping.

## Vendored by reference

`vendor/pixiv-mcp-server/` is a local clone of the MIT-licensed upstream project.
It is **not committed** and not redistributed with mono-uihub:

- `vendor/.gitignore` ignores all checkouts;
- `vendor/manifest.json` pins the repository URL, commit, license, and fetch date;
- `get.py pixiv-login` clones or fast-forwards the checkout on demand;
- the upstream `get_token.py` runs through `uv run --no-project --with requests`,
  so its dependencies are never installed into the vendored tree.

The only reason this checkout exists is the interactive Pixiv OAuth flow. Once
`PIXIV_REFRESH_TOKEN` is in `.env`, `sources/pixiv.py` talks to the official App
API directly and the vendor tree is unused.

## If you add a vendored library

1. Put it under `tools/resource-getter/vendor/<library>/`.
2. Include the upstream `LICENSE` verbatim and a `NOTICE` with the source URL,
   version/commit, and the files used.
3. Add a row to the table above.
4. Import it through a thin wrapper in `lib/` so a future replacement touches one
   file, not every source.
5. Do not vendor non-redistributable weights or assets (e.g. BRIA RMBG).
