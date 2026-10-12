# mono-uihub

A growing hub of handcrafted, high-fidelity UI prototypes. Each page is a self-contained front-end prototype — pure HTML / CSS / vanilla JS, no build step, no framework — built for exploring visual direction, interaction details, and interface polish.

[中文说明](README.zh.md)

## What's inside

```
mono-uihub/
├── ui/                        # UI prototypes, one folder per page
│   ├── keyboard-configurator/ # Mechanical keyboard online customizer (case / switch / keycap)
│   └── im-desktop-chat/       # Desktop IM chat window
├── skills/                    # Agent skill used to generate these pages
│   └── SKILL.md
└── LICENSE                    # MIT
```

## Pages

| Page | Path | Description |
| --- | --- | --- |
| Keyboard Configurator | `ui/keyboard-configurator/index.html` | Online configurator for a fictional keyboard brand: pick the case, switch and keycaps, preview the board live, with spec bars and price summary. Presented as a desktop "engineering drawing" window. |
| IM Desktop Chat | `ui/im-desktop-chat/index.html` | A desktop instant-messaging chat interface prototype. |

## How to use

No installation, no build. Just open any `index.html` in your browser.

```bash
# optional: serve locally
npx serve .
# or simply double-click
ui/keyboard-configurator/index.html
```

All data is mocked locally. Interactions (selection, cart, toasts, view switching) are wired with minimal vanilla JS for demo purposes — no real backend.

## The skill behind the pages

[`skills/SKILL.md`](skills/SKILL.md) documents the methodology used to generate every page in this hub: deriving a fresh visual direction from the page's content each time (color, type, layout, motion), avoiding templated "AI look", and shipping interactive high-fidelity prototypes.

## License

[MIT](LICENSE)
