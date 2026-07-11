# OneTap Official Website Asset Strategy

## Purpose

This document defines how production image assets should be handled for the OneTap official website.

## Current Assets

Current screenshots are product UI captures used to communicate the desktop assistant workflow:

- personal arsenal and inventory
- personal performance data
- pro ability radar
- skin comparison
- gear comparison
- match history and highlight generation
- map detail and AI coaching context

The site serves WebP derivatives from `assets/` and keeps source PNG files only as inputs for the reproducible optimization command.

## Loading Rules

- Above-the-fold brand and hero product images use `data-critical-image`.
- Critical hero product screenshots use `fetchpriority="high"`.
- Below-the-fold screenshots use `loading="lazy"` and `decoding="async"`.
- Dynamically rendered queue thumbnails must set `image.loading = "lazy"`.
- Every content image must declare intrinsic width and height.

## Compression Rules

Generate delivery assets with:

```powershell
npm run optimize:images
```

The optimizer applies these production rules:

- export screenshots as WebP at 1600px maximum width
- export brand artwork as WebP at 512px maximum width
- keep every referenced raster asset under 700 KB
- keep all referenced raster assets under 4 MB combined
- retain PNG files only as local optimization inputs until source storage is externalized

## Naming Rules

Use stable, descriptive names:

```text
assets/screenshot-home-arsenal.webp
assets/screenshot-personal-data.webp
assets/screenshot-pro-radar.webp
assets/screenshot-skin-compare.webp
assets/screenshot-gear-compare.webp
assets/screenshot-match-history.webp
assets/screenshot-generating.webp
assets/screenshot-map-detail.webp
```

## Validation

Run these commands before release:

```powershell
node scripts/validate-site.mjs
node scripts/validate-section-data.mjs
npm run validate:browser
git diff --check
```

For visual QA, review desktop, tablet, and mobile widths after every image replacement.
