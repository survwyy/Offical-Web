import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const requiredFiles = [
  "src/data/metrics.js",
  "src/data/sections.js",
  "src/scripts/render-sections.js",
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function assertFile(path) {
  if (!existsSync(join(root, path))) {
    fail(`Missing required Phase 2 file: ${path}`);
  }
}

class FakeNode {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.className = "";
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  set textContent(value) {
    this.text = value;
    this.children = [];
  }

  get lastChild() {
    return this.children[this.children.length - 1];
  }
}

function createFakeDocument(selectors) {
  const roots = Object.fromEntries(selectors.map((selector) => [selector, new FakeNode("root")]));
  return {
    roots,
    createElement: (tag) => new FakeNode(tag),
    querySelector: (selector) => roots[selector] || null,
  };
}

function loadBrowserGlobals(paths, document) {
  const sandbox = { window: {}, document, console };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  paths.forEach((path) => {
    vm.runInContext(readFileSync(join(root, path), "utf8"), sandbox, { filename: path });
  });
  return sandbox.window;
}

function collectI18nKeys(value, keys = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectI18nKeys(item, keys));
    return keys;
  }
  if (!value || typeof value !== "object") return keys;
  Object.entries(value).forEach(([key, itemValue]) => {
    if (key.endsWith("Key")) keys.push(itemValue);
    collectI18nKeys(itemValue, keys);
  });
  return keys;
}

function assertUniqueIds(name, items) {
  const ids = items.map((item) => item.id);
  const unique = new Set(ids);
  if (ids.length !== unique.size) fail(`${name} contains duplicate ids`);
  if (ids.some((id) => !id)) fail(`${name} contains empty ids`);
}

requiredFiles.forEach(assertFile);

if (process.exitCode) process.exit(1);

const globals = loadBrowserGlobals([
  "src/data/translations.js",
  "src/data/metrics.js",
  "src/data/sections.js",
  "src/scripts/render-sections.js",
]);

const translations = globals.OneTapTranslations;
const metrics = globals.OneTapMetrics;
const sections = globals.OneTapSections;
const renderer = globals.OneTapRender;

if (!metrics?.heroMetrics?.length) fail("OneTapMetrics.heroMetrics is empty");
if (!sections?.proofRail?.length) fail("OneTapSections.proofRail is empty");
if (!renderer?.renderSections) fail("OneTapRender.renderSections is missing");

const renderTargets = [
  '[data-render="hero-metrics"]',
  '[data-render="proof-rail"]',
  '[data-render="command-modules"]',
  '[data-render="compare-modules"]',
  '[data-render="studio-queue"]',
  '[data-render="coach-items"]',
];

const fakeDocument = createFakeDocument(renderTargets);
const renderGlobals = loadBrowserGlobals([
  "src/data/metrics.js",
  "src/data/sections.js",
  "src/scripts/render-sections.js",
], fakeDocument);
renderGlobals.OneTapRender.renderSections();

assertUniqueIds("heroMetrics", metrics.heroMetrics);
assertUniqueIds("proofRail", sections.proofRail);
assertUniqueIds("commandModules", sections.commandModules);
assertUniqueIds("compareModules", sections.compareModules);
assertUniqueIds("studioQueue", sections.studioQueue);
assertUniqueIds("coachItems", sections.coachItems);

const expectedCounts = {
  '[data-render="hero-metrics"]': metrics.heroMetrics.length,
  '[data-render="proof-rail"]': sections.proofRail.length,
  '[data-render="command-modules"]': sections.commandModules.length,
  '[data-render="compare-modules"]': sections.compareModules.length,
  '[data-render="studio-queue"]': sections.studioQueue.length,
  '[data-render="coach-items"]': sections.coachItems.length,
};

Object.entries(expectedCounts).forEach(([selector, count]) => {
  const actual = fakeDocument.roots[selector].children.length;
  if (actual !== count) fail(`${selector} rendered ${actual}, expected ${count}`);
});

const i18nKeys = [
  ...collectI18nKeys(metrics),
  ...collectI18nKeys(sections),
];

const missing = i18nKeys.filter((key) => !translations.zh[key] || !translations.en[key]);
if (missing.length) fail(`Missing translations for data keys: ${missing.join(", ")}`);

if (!process.exitCode) {
  console.log(JSON.stringify({
    heroMetrics: metrics.heroMetrics.length,
    proofRail: sections.proofRail.length,
    commandModules: sections.commandModules.length,
    compareModules: sections.compareModules.length,
    studioQueue: sections.studioQueue.length,
    coachItems: sections.coachItems.length,
  }, null, 2));
}
