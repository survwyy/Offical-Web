# OneTap Official Website Architecture

## 1. Goal
Define the target architecture for the OneTap / 颗秒 official website.

The current page works as a static landing page, but it must be refactored from a single-file prototype into a maintainable structure that follows `AI Coding Rules.docx`.

Primary goals:
- clear module boundaries
- single responsibility per file
- files under 300 lines where practical
- separated HTML, CSS, content data, analytics, and interaction logic
- explicit validation before completion
- no unnecessary runtime dependencies

## 2. Current State
Current implementation:
- `index.html` contains HTML, CSS, JS, i18n data, and analytics logic
- `assets/` contains brand icons and product screenshots
- the site is static and can run through `python -m http.server`

Current strengths:
- Chinese and English language switching
- Chinese and English brand icon switching
- responsive desktop, tablet, and mobile layout
- download and contact CTAs
- basic analytics through `window.dataLayer`

Current gaps:
- `index.html` is larger than 300 lines
- module responsibilities are coupled
- no committed validation script
- no automated tests or static checks for translation coverage

## 3. Target File Tree
The website should remain static until a real requirement needs routing, CMS, accounts, or server rendering.

```text
Offical-Web/
  index.html
  assets/
  docs/
    architecture.md
    refactor-plan.md
  src/
    data/
      translations.js
      metrics.js
      sections.js
    scripts/
      analytics.js
      i18n.js
      main.js
      validators.js
    styles/
      tokens.css
      base.css
      layout.css
      hero.css
      hero-stage.css
      proof-command.css
      intel-compare.css
      studio-download.css
      responsive-tablet.css
      responsive-mobile.css
  scripts/
    validate-site.mjs
```

If the site later moves to TypeScript or a bundler, preserve these boundaries:

```text
src/
  app/
  features/
    language/
    analytics/
    landing/
  components/
  data/
  styles/
  tests/
```

## 4. Module Boundaries
### `index.html`
Responsibility:
- semantic document structure
- section anchors and accessible static markup
- CSS and JS imports

Must not contain:
- large inline CSS
- large inline JS
- translation dictionaries
- analytics implementation

### `src/styles/*.css`
Responsibility:
- visual system and layout
- split by purpose, not by random page fragments

Files:
- `tokens.css`: colors, spacing, typography, radius, shadows
- `base.css`: reset, body, base elements
- `layout.css`: navigation, wrappers, grids, sections
- `hero.css`: hero and HUD product stage
- `hero-stage.css`: floating HUD product windows
- `proof-command.css`: proof rail and command center
- `intel-compare.css`: pro intelligence and comparison sections
- `studio-download.css`: studio, coach, download, and footer
- `responsive-tablet.css`: tablet breakpoints
- `responsive-mobile.css`: mobile breakpoints

### `src/data/*.js`
Responsibility:
- static content and display data
- no DOM access
- no analytics
- no styling logic

Files:
- `translations.js`: Chinese and English copy
- `metrics.js`: hero and product metric data
- `sections.js`: repeated section/card data

### `src/scripts/i18n.js`
Responsibility:
- resolve initial language
- update `[data-i18n]` nodes
- switch brand icons
- persist language to `localStorage`

Browser namespace:

```js
window.OneTapI18n = { initI18n, setLanguage, getLanguage };
```

### `src/scripts/analytics.js`
Responsibility:
- define analytics event shape
- push events to `window.dataLayer`
- bind `[data-track]` elements

Browser namespace:

```js
window.OneTapAnalytics = { track, bindTrackedElements };
```

Event shape:

```js
{
  event: string,
  page: "official_home",
  timestamp: string,
  action?: string,
  label?: string,
  lang?: "zh" | "en"
}
```

### `src/scripts/validators.js`
Responsibility:
- browser-side development checks
- missing DOM target warnings
- missing translation key warnings

### `src/scripts/main.js`
Responsibility:
- entry point
- wire i18n, analytics, and reveal behavior

Must not contain:
- large dictionaries
- copied CSS logic
- section content data

### `scripts/validate-site.mjs`
Responsibility:
- Node validation for static files
- image reference checks
- translation key coverage checks
- required CTA and support link checks

## 5. Data Flow
Language switching:

```text
click language button
  -> i18n.setLanguage(lang)
  -> update document lang
  -> update data-i18n text
  -> update brand icons
  -> persist localStorage
  -> analytics.track("language_change")
```

Analytics:

```text
click tracked element
  -> read data-track
  -> build normalized payload
  -> push to window.dataLayer
  -> dispatch onetap:analytics event
```

Page initialization:

```text
load index.html
  -> apply CSS files
  -> run main.js
  -> initialize language
  -> bind analytics
  -> enable reveal observer
```

## 6. State Management
Allowed state:
- selected language
- reveal class state
- analytics event queue

State source of truth:
- current language: `i18n` module
- persisted language: `localStorage["onetap-lang"]`
- analytics: `window.dataLayer`

Not needed now:
- global store
- client router
- server state cache
- API client

## 7. External Interfaces
Download link:

```text
https://github.com/survwyy/cs2zs/releases
```

Support email:

```text
support@onetap.cool
```

Asset rule:

```text
assets/<file>
```

Committed code must not contain local absolute asset paths.

## 8. Testing Boundary
Minimum validation:

```powershell
node scripts/validate-site.mjs
git diff --check
```

Manual viewport checks:
- desktop width 1440
- tablet width 768
- mobile width 430
- mobile width 390
- Chinese language
- English language

## 9. Architecture Decisions
Decision: keep the website static for now.

Reason:
- the current requirement is an official marketing/download site
- no account, CMS, or dynamic server route is required
- static hosting keeps deployment simple

Decision: do not introduce React/Vite immediately.

Reason:
- the current page can be made maintainable with static modules
- a bundler becomes useful only if page count or component reuse grows
