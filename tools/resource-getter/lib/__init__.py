"""Shared internals for resource-getter.

Everything here is Python standard library only — no pip install, no build step.
Keep provider-specific logic in ``sources/<name>.py``; this package only holds
reusable plumbing (HTTP, robots, caching, probing, SVG/PNG inspection).
"""
