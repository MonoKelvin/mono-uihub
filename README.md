# mono-uihub

AI-powered UI prototype design hub. Generate design pages in one sentence, providing endless inspiration for designers and developers.

[中文说明](README.zh.md)

## What's inside

```
mono-uihub/
├── ui/                        # UI prototypes, one folder per page
│   └── ...                    # pages grow over time
├── skills/                    # Agent skills behind the generation
│   ├── mono-ui-prototype/     # the page-generation skill
│   │   └── SKILL.md
│   └── image-purify/          # clean-image prompt packs (no noise, no scaly texture)
│       ├── SKILL.md
│       └── purify.json        # single source of truth, read by the tool
├── tools/                     # helper scripts for the agent
│   └── image-forge/           # on-demand transparent PNG generation (auto-purified prompts)
├── LICENSE                    # MIT
└── README.md / README.zh.md
```

## How it works

Describe a page in one sentence — say, "an online configurator for a mechanical keyboard" or "a desktop chat window for an IM app". The skill in [`skills/SKILL.md`](skills/SKILL.md) turns that brief into a complete, high-fidelity prototype:

- **Derives a fresh visual direction every time** — color, typography, layout and motion are reasoned from the page's content and audience, never copied from a fixed template or the previous page.
- **Pure front-end, zero setup** — every page is self-contained HTML / CSS / vanilla JS. No build step, no framework, no dependencies to install.
- **Interactive, not a dead mock** — clickable elements are wired with minimal JS and local mock data, so prototypes can be demoed as-is.
- **Anti-slop by design** — a hard checklist of "AI look" tells is enforced before delivery: one accent color, one radius system, real copy, deliberate whitespace.
- **Clean generated imagery** — when a page needs a custom asset, [`skills/image-purify`](skills/image-purify/SKILL.md) is layered onto the prompt automatically, so assets come back free of noise, fish-scale micro-texture and floating debris.

## How to use

Browse the `ui/` folder and open any `index.html` in your browser. That's it.

```bash
# optional: serve locally
npx serve .
```

To generate a new page, hand the skill to your coding agent with a one-sentence brief.

## License

[MIT](LICENSE)
