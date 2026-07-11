# P0 Site Quality Design

## Goal

Prepare the static OneTap official website for repeatable production checks without changing its approved visual direction or runtime architecture.

## Scope

- add one npm-based validation entry point
- add GitHub Actions quality checks
- optimize referenced raster assets to WebP
- enforce image size and reference budgets
- add browser checks for desktop, tablet, and mobile layouts
- verify Chinese and English logo switching in a real browser

The work does not add a frontend framework, production analytics provider, download API, CMS, or backend.

## Architecture

The website remains a dependency-free static runtime. Development-only dependencies may be used by scripts under `scripts/` and must not be loaded by the website.

- `package.json` exposes stable validation commands.
- `scripts/validate-site.mjs` remains the fast static contract check.
- `scripts/validate-browser.mjs` owns real-browser responsive and language checks.
- `scripts/optimize-images.mjs` reproducibly generates WebP delivery assets.
- `.github/workflows/quality.yml` runs the same commands in CI.

## Asset Rules

- Referenced raster content uses WebP.
- Brand assets are capped at 512 pixels on their longest edge.
- Product screenshots preserve their source dimensions unless a width cap is needed.
- Every referenced content image declares intrinsic `width` and `height`.
- No referenced raster asset may exceed 700 KB.
- All referenced raster assets together may not exceed 4 MB.
- Source PNG files may be removed after visual comparison because Git history preserves them.

## Browser Contract

The browser validator serves the repository through a local HTTP server and checks these viewports:

- 1440 x 1000 desktop
- 768 x 1024 tablet
- 430 x 932 mobile
- 390 x 844 mobile

For every viewport it verifies that the page has no horizontal overflow and that the primary page structure is visible. It also switches between Chinese and English and verifies the matching brand asset, document language, and analytics event.

## CI Contract

GitHub Actions uses Node 22 and runs:

```text
npm ci
npm run validate
```

The validation command fails on missing assets, translation gaps, render count changes, performance budget violations, responsive overflow, language switching regressions, or invalid whitespace.

## Acceptance

- existing static and section-data checks pass
- browser checks pass at all four viewports
- Chinese uses the Chinese logo and English uses the English logo
- referenced raster assets meet the size budgets
- CI workflow calls the same validation command used locally
- no production page imports npm packages
