# P0 Site Quality Implementation Plan

> **For the implementing agent:** Use `executing-plans` to carry out each checkbox in order. Apply TDD to behavior and validation changes.

**Goal:** Add repeatable responsive, asset, and CI quality gates while reducing the website image payload.

**Architecture:** Keep the production website static. Add development-only Node scripts for asset generation and Playwright browser verification, then expose them through npm scripts and GitHub Actions.

**Tech stack:** HTML, CSS, browser JavaScript, Node.js 22, Playwright, Sharp, GitHub Actions.

---

### Task 1: Define the production quality contract

**Files:**
- Modify: `scripts/validate-site.mjs`
- Create: `package.json`
- Create: `.github/workflows/quality.yml`

- [x] Extend `validate-site.mjs` to require `package.json`, the CI workflow, WebP references, image dimensions, and asset budgets.
- [x] Run `node scripts/validate-site.mjs` and confirm it fails because the new contract is not implemented.
- [x] Add `package.json` scripts and the CI workflow.
- [x] Run the static validator again; only WebP and image-dimension failures should remain.

### Task 2: Generate and adopt optimized assets

**Files:**
- Create: `scripts/optimize-images.mjs`
- Create: `assets/*.webp`
- Modify: `index.html`
- Modify: `src/data/sections.js`
- Modify: `docs/asset-strategy.md`

- [x] Implement a deterministic Sharp script that converts brand assets and product screenshots to WebP.
- [x] Run the optimizer and record before/after byte totals.
- [x] Update all website references and intrinsic image dimensions.
- [x] Run `node scripts/validate-site.mjs` and confirm the new asset contract passes.
- [x] Visually compare the hero and one lower-page screenshot against the PNG source.

### Task 3: Add responsive browser validation

**Files:**
- Create: `scripts/validate-browser.mjs`
- Modify: `package.json`

- [x] Wire the npm browser command to a missing validator and confirm it fails.
- [x] Write browser assertions that reproduce the existing Chinese title defect.
- [x] Implement the local static server, viewport checks, language checks, and analytics assertion.
- [x] Run the browser validator and confirm all viewport scenarios pass.
- [x] Capture desktop and mobile screenshots for visual inspection.

### Task 4: Complete CI and documentation integration

**Files:**
- Modify: `README.md`
- Modify: `docs/refactor-plan.md`
- Modify: `.github/workflows/quality.yml`

- [x] Document install, preview, optimize, and validation commands.
- [x] Mark completed P0 production-hardening checks and document the remaining Lighthouse and deployment work.
- [x] Run `npm run validate`, `git diff --check`, and the file-length gate.
- [x] Sync the verified output to the legacy preview directory.
- [x] Commit and push the feature branch after final verification.
