# OneTap Official Website

Static official website for OneTap / 颗秒, a CS2 desktop assistant.

## Preview

Install the development-only validation tools:

```powershell
npm install
npm run setup:browsers
```

Open `index.html` directly in a browser, or run a local static server:

```powershell
python -m http.server 4177
```

Then visit:

```text
http://127.0.0.1:4177/
```

## Contents

- Chinese and English language switch
- Chinese brand icon for 颗秒 and English brand icon for OneTap
- CS2 demo review, personal skins and peripherals, pro player comparison, AI coach, and highlight generation sections
- Download and contact CTAs
- Basic analytics events via `window.dataLayer`

## Engineering Docs

- [Architecture](docs/architecture.md)
- [Refactor plan](docs/refactor-plan.md)
- [Asset strategy](docs/asset-strategy.md)

## Quality Commands

Generate the optimized WebP delivery assets from the source PNG files:

```powershell
npm run optimize:images
```

Run static contracts, section rendering checks, and four responsive browser scenarios:

```powershell
npm run validate
```

The browser validation uses Chromium and checks desktop, tablet, 430px mobile, and 390px mobile layouts. CI installs Chromium automatically.
