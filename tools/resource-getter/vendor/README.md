# vendor/ — third-party source, by reference only

This directory holds **local checkouts of third-party repositories**. The source
is intentionally **not committed** to mono-uihub:

- `vendor/.gitignore` ignores every checkout;
- only `README.md` and `manifest.json` are tracked;
- `manifest.json` pins the repository URL and commit for reproducibility.

## pixiv-mcp-server

| | |
| --- | --- |
| Repo | https://github.com/222wcnm/pixiv-mcp-server |
| Commit | `c02e5e6` (see `manifest.json`) |
| License | MIT (upstream `LICENSE`) |
| Why | One-time acquisition of `PIXIV_REFRESH_TOKEN` via `get_token.py` |
| Runtime use | **No** — `sources/pixiv.py` talks to the official App API directly |

```bash
# clone or update, without starting the login wizard
python tools/resource-getter/get.py pixiv-login --fetch-only
python tools/resource-getter/get.py pixiv-login --fetch-only --update

# interactive login; writes the token into tools/resource-getter/.env
python tools/resource-getter/get.py pixiv-login

# validate the new token against the Pixiv API
python tools/resource-getter/get.py pixiv-login --verify
```

`get_token.py` is interactive and opens the Pixiv login page in a browser. It
needs `requests`; the command runs it through `uv run --no-project --with
requests`, so nothing is installed into the vendored tree.

## Why not a git submodule?

The upstream project is only needed **once**, to obtain a token — not at runtime.
A submodule would force every clone of mono-uihub to initialise a nested repo it
does not otherwise need. The reference approach keeps the parent repository clean
and still pins the exact commit.

If you do want a submodule, convert it explicitly:

```bash
rm -rf tools/resource-getter/vendor/pixiv-mcp-server
# remove the `*` ignore rule for this path first, then:
git submodule add https://github.com/222wcnm/pixiv-mcp-server \
  tools/resource-getter/vendor/pixiv-mcp-server
```

## Security

- `tools/resource-getter/.env` (which receives the refresh token) is gitignored.
- Never commit the token, `vendor/pixiv-mcp-server/.env`, or the upstream
  project's `downloads/` folder.
- The token grants access to the Pixiv account that authorised it. Treat it like
  a password.
