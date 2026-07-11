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

The current site keeps these source screenshots in `assets/` and applies browser-level loading controls.

## Loading Rules

- Above-the-fold brand and hero product images use `data-critical-image`.
- Critical hero product screenshots use `fetchpriority="high"`.
- Below-the-fold screenshots use `loading="lazy"` and `decoding="async"`.
- Dynamically rendered queue thumbnails must set `image.loading = "lazy"`.

## Compression Rules

Before production launch, replace raw captures with optimized variants:

- export large screenshots as WebP or AVIF when hosting supports it
- keep PNG only when alpha or exact UI fidelity is required
- target 1600px maximum width for full-width screenshots
- target 900px maximum width for card and floating panel screenshots
- keep each below-the-fold screenshot under 300 KB where possible
- keep the social preview image under 600 KB where possible

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
git diff --check
```

For visual QA, review desktop, tablet, and mobile widths after every image replacement.
