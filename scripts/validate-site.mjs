import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const indexPath = path.join(root, "index.html");
const html = fs.readFileSync(indexPath, "utf8");

const failures = [];

function fail(message) {
  failures.push(message);
}

function readTranslations() {
  const filePath = path.join(root, "src/data/translations.js");
  const code = fs.readFileSync(filePath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: filePath });
  return sandbox.window.OneTapTranslations;
}

function readContentData() {
  const sandbox = { window: {} };
  ["src/data/metrics.js", "src/data/sections.js"].forEach((ref) => {
    const filePath = path.join(root, ref);
    if (fs.existsSync(filePath)) {
      vm.runInNewContext(fs.readFileSync(filePath, "utf8"), sandbox, { filename: ref });
    }
  });
  return sandbox.window;
}

function matchAll(pattern, source) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

function collectByKey(value, keyName, values = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectByKey(item, keyName, values));
    return values;
  }
  if (!value || typeof value !== "object") return values;
  Object.entries(value).forEach(([key, itemValue]) => {
    if (key === keyName || key.endsWith(keyName)) values.push(itemValue);
    collectByKey(itemValue, keyName, values);
  });
  return values;
}

function assertExistingRelativeFiles(label, refs) {
  refs.forEach((ref) => {
    if (/^(https?:|mailto:|#)/.test(ref)) return;
    const cleanRef = ref.split("?")[0];
    if (!fs.existsSync(path.join(root, cleanRef))) {
      fail(`${label} does not exist: ${ref}`);
    }
  });
}

function assertFileExists(ref) {
  if (!fs.existsSync(path.join(root, ref))) fail(`Required file is missing: ${ref}`);
}

function assertHtmlIncludes(label, snippets) {
  snippets.forEach((snippet) => {
    if (!html.includes(snippet)) fail(`${label} is missing: ${snippet}`);
  });
}

function assertLazyImages() {
  const imageTags = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  imageTags.forEach((tag) => {
    if (tag.includes("data-critical-image")) return;
    if (!tag.includes('loading="lazy"')) fail(`Image is missing lazy loading: ${tag}`);
  });
}

const imageRefs = matchAll(/<img[^>]+src="([^"]+)"/g, html);
const styleRefs = matchAll(/<link[^>]+href="([^"]+\.css)"/g, html);
const scriptRefs = matchAll(/<script[^>]+src="([^"]+\.js)"/g, html);
const localHrefRefs = matchAll(/<(?:a|link)[^>]+href="([^"]+)"/g, html);

assertExistingRelativeFiles("Image", imageRefs);
assertExistingRelativeFiles("Stylesheet", styleRefs);
assertExistingRelativeFiles("Script", scriptRefs);
assertExistingRelativeFiles("Linked file", localHrefRefs);

const translations = readTranslations();
const contentData = readContentData();
const dataI18nKeys = collectByKey(contentData, "Key");
const dataImageRefs = collectByKey(contentData, "image");
assertExistingRelativeFiles("Data image", dataImageRefs);

const i18nKeys = [...new Set([...matchAll(/data-i18n="([^"]+)"/g, html), ...dataI18nKeys])];
const missingZh = i18nKeys.filter((key) => !translations.zh?.[key]);
const missingEn = i18nKeys.filter((key) => !translations.en?.[key]);

if (missingZh.length > 0) fail(`Missing zh translations: ${missingZh.join(", ")}`);
if (missingEn.length > 0) fail(`Missing en translations: ${missingEn.join(", ")}`);

const requiredText = [
  "support@onetap.cool",
  "https://github.com/survwyy/cs2zs/releases",
  "assets/brand-onetap-zh.png",
  "assets/brand-onetap-en.png",
];

requiredText.forEach((text) => {
  const inHtml = html.includes(text);
  const inScripts = scriptRefs.some((ref) => fs.readFileSync(path.join(root, ref), "utf8").includes(text));
  if (!inHtml && !inScripts) fail(`Required reference is missing: ${text}`);
});

const requiredTracks = [
  "nav_download",
  "hero_download",
  "download_release",
  "contact_mail",
  "support_email",
];

requiredTracks.forEach((track) => {
  if (!html.includes(`data-track="${track}"`)) fail(`Required data-track is missing: ${track}`);
});

[
  "assets/favicon.svg",
  "docs/asset-strategy.md",
  "privacy.html",
  "terms.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
].forEach(assertFileExists);

assertHtmlIncludes("Production metadata", [
  'name="robots" content="index, follow"',
  'name="theme-color"',
  'property="og:type" content="website"',
  'property="og:title"',
  'property="og:description"',
  'property="og:image"',
  'name="twitter:card" content="summary_large_image"',
  '<link rel="canonical" href="https://onetap.cool/"',
  '<link rel="icon" type="image/svg+xml" href="assets/favicon.svg"',
  '<link rel="manifest" href="site.webmanifest"',
  'href="privacy.html"',
  'href="terms.html"',
]);

assertLazyImages();

const renderScript = fs.readFileSync(path.join(root, "src/scripts/render-sections.js"), "utf8");
if (!renderScript.includes('image.loading = "lazy"')) {
  fail("Rendered queue images must set loading=\"lazy\"");
}

const checkedFiles = [
  "index.html",
  ...styleRefs,
  ...scriptRefs,
  "src/data/translations.js",
  "scripts/validate-site.mjs",
  "scripts/validate-section-data.mjs",
  "docs/asset-strategy.md",
  "privacy.html",
  "terms.html",
];

checkedFiles.forEach((ref) => {
  const filePath = path.join(root, ref);
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).length;
  if (lines > 300) fail(`File exceeds 300 lines: ${ref} (${lines})`);
});

if (failures.length > 0) {
  console.error(failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      imageRefs: imageRefs.length,
      styleRefs: styleRefs.length,
      scriptRefs: scriptRefs.length,
      i18nKeys: i18nKeys.length,
      checkedFiles: checkedFiles.length,
    },
    null,
    2,
  ),
);
