"""One module per asset source.

Each file owns its endpoint patterns, auth, license notes and quirks. The CLI
only relies on this small surface:

    NAME, TITLE, KIND, HOME, LICENSE, REQUIRES_ENV
    search(query, **opts) -> list[Asset]     # API / crawler / MCP sources
    build(**opts) -> Asset                   # URL-only sources
    resolve(asset, **opts) -> str            # CDN URL, static URL, etc.
    from_url(url) -> Asset                   # optional direct link support
"""
