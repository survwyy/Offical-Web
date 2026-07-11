# OneTap Official Website Refactor Plan

## 1. Purpose

This plan describes how to refactor the current single-file official website into the architecture defined in `docs/architecture.md`.

The refactor must preserve the current visual direction while improving maintainability and rule compliance.

## 2. Constraints

- Keep the site static unless a new requirement needs a framework.
- Do not add runtime dependencies in Phase 1.
- Keep files under 300 lines where practical.
- Keep current assets and public visual behavior.
- Do not change the support email: `support@onetap.cool`.
- Do not change the release URL unless a new official download URL is provided.

## 3. Phase 1: Non-functional Split

Goal:

- keep visual output unchanged
- split inline CSS and JS into files
- add validation script

Target files:

```text
src/styles/tokens.css
src/styles/base.css
src/styles/layout.css
src/styles/hero.css
src/styles/hero-stage.css
src/styles/proof-command.css
src/styles/intel-compare.css
src/styles/studio-download.css
src/styles/responsive-tablet.css
src/styles/responsive-mobile.css
src/data/translations.js
src/scripts/analytics.js
src/scripts/i18n.js
src/scripts/main.js
src/scripts/validators.js
scripts/validate-site.mjs
```

Steps:

1. Extract CSS variables and tokens.
2. Extract reset and base styles.
3. Extract layout, hero, section, and responsive styles.
4. Extract translation dictionary.
5. Extract analytics helpers.
6. Extract language switching helpers.
7. Add `main.js` as the only entry point.
8. Add `validate-site.mjs`.
9. Update `index.html` to load CSS and JS modules.

Acceptance:

- desktop screenshot has no intentional visual regression
- 390px, 430px, and 768px mobile/tablet checks have no horizontal overflow
- image references pass validation
- translation keys pass validation
- tracked elements still emit analytics events

## 4. Phase 2: Content Data Extraction

Goal:

- move repeated metric and section card data out of HTML
- keep HTML semantic and compact

Target files:

```text
src/data/metrics.js
src/data/sections.js
src/scripts/render-sections.js
scripts/validate-section-data.mjs
```

Steps:

1. Extract hero metric definitions.
2. Extract proof rail item definitions.
3. Extract repeated module card definitions where appropriate.
4. Render repeated cards from stable data ids.
5. Validate data ids, translation keys, and render output counts.

Acceptance:

- repeated content has stable ids
- repeated markup is not duplicated manually
- translation keys still resolve in both languages
- no section content is hidden from accessibility tree
- `node scripts/validate-section-data.mjs` passes

## 5. Phase 3: Production Hardening

Goal:

- prepare the website for production deployment

Tasks:

- add Open Graph metadata
- add favicon and app icons
- add image compression strategy
- add lazy loading for below-the-fold screenshots
- add privacy and terms pages if required
- define final download endpoint
- run Lighthouse performance checks

Acceptance:

- Lighthouse mobile performance is reviewed
- key images are optimized
- SEO preview metadata is present
- legal and support links are present if required

## 6. Validation Commands

Static validation:

```powershell
node scripts/validate-site.mjs
node scripts/validate-section-data.mjs
git diff --check
```

Local preview:

```powershell
python -m http.server 4177 --bind 127.0.0.1 --directory C:\Users\Elven\Documents\官网\Offical-Web
```

Manual viewport checks:

- desktop width 1440
- tablet width 768
- mobile width 430
- mobile width 390
- Chinese language
- English language

## 7. Validation Script Scope

`scripts/validate-site.mjs` should check:

- every `<img src="...">` points to an existing file
- every `[data-i18n]` key exists in Chinese and English dictionaries
- Chinese and English brand icons exist
- support email link exists
- release download link exists
- required analytics attributes exist on primary CTAs

The script should exit with code `1` on failure.

## 8. Test Strategy

No framework is required in Phase 1.

Minimum tests:

- Node validation script for static references
- browser screenshot checks for layout
- manual analytics event smoke test in browser console

If a bundler or framework is introduced later:

- use `vitest` for module tests
- test `setLanguage`
- test translation key coverage
- test analytics payload shape

## 9. Risk Control

Main risks:

- visual regression when splitting CSS
- missing translation keys after extraction
- module load issues when opened through `file://`

Mitigation:

- use a local static server for validation
- keep a visual screenshot before and after Phase 1
- keep validation script framework-free
- use relative paths for static assets

## 10. Completion Criteria

The refactor is complete when:

- `index.html` is reduced to semantic structure and imports
- inline CSS and JS are removed
- no new file exceeds 300 lines except intentionally documented data files
- validation command passes
- mobile/tablet desktop screenshots are checked
- repository is clean after commit
