import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const rootRealPath = await fs.realpath(root);
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "mobile-390", width: 390, height: 844 },
];
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, "http://127.0.0.1").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) return null;
  try {
    const realPath = await fs.realpath(filePath);
    if (!realPath.startsWith(`${rootRealPath}${path.sep}`) && realPath !== rootRealPath) return null;
    return realPath;
  } catch (error) {
    if (error.code === "ENOENT") return filePath;
    throw error;
  }
}

function createStaticServer() {
  return http.createServer(async (request, response) => {
    try {
      const filePath = await resolveRequestPath(request.url || "/");
      if (!filePath) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const content = await fs.readFile(filePath);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      });
      response.end(content);
    } catch (error) {
      const status = error instanceof URIError ? 400 : error.code === "ENOENT" ? 404 : 500;
      response.writeHead(status).end(status === 400 ? "Bad request" : "Not found");
    }
  });
}

async function assertLayout(page, scenario) {
  const layout = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  assert.ok(layout.body <= layout.viewport + 1, `${scenario}: body overflow ${JSON.stringify(layout)}`);
  assert.ok(layout.document <= layout.viewport + 1, `${scenario}: document overflow ${JSON.stringify(layout)}`);

  for (const selector of [".nav", ".hero", "#command", "#intel", "#studio", "#coach", "#download"]) {
    const locator = page.locator(selector);
    assert.equal(await locator.count(), 1, `${scenario}: missing ${selector}`);
    assert.equal(await locator.isVisible(), true, `${scenario}: hidden ${selector}`);
    const box = await locator.boundingBox();
    assert.ok(box && box.width > 0 && box.height > 0, `${scenario}: empty ${selector}`);
  }
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return server.address().port;
}

async function loadLazyImages(page) {
  await page.evaluate(async () => {
    const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const step = Math.max(300, Math.floor(window.innerHeight * 0.75));
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      window.scrollTo(0, top);
      await wait(40);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await wait(150);
  });
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => window.scrollY === 0);
}

async function validateViewport(browser, baseUrl, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("requestfailed", (request) => browserErrors.push(`${request.url()}: ${request.failure()?.errorText}`));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  assert.equal(await page.locator('[data-render="hero-metrics"] .metric').count(), 4, `${viewport.name}: hero metrics`);
  assert.equal(await page.locator('[data-render="studio-queue"] .queue-row').count(), 3, `${viewport.name}: studio queue`);
  await assertLayout(page, `${viewport.name}/zh-initial`);

  await page.locator('[data-lang="en"]').click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en", `${viewport.name}: English lang`);
  assert.equal(await page.title(), "OneTap - CS2 Desktop Assistant", `${viewport.name}: English title`);
  const englishLogos = await page.locator("[data-brand-logo]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src")));
  assert.ok(englishLogos.length > 0, `${viewport.name}: English logo count`);
  assert.ok(englishLogos.every((src) => src?.endsWith("brand-onetap-en.webp")), `${viewport.name}: English logos`);
  await assertLayout(page, `${viewport.name}/en`);

  await page.locator('[data-lang="zh"]').click();
  assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN", `${viewport.name}: Chinese lang`);
  assert.equal(await page.title(), "颗秒 OneTap - CS2 Desktop Assistant", `${viewport.name}: Chinese title`);
  const chineseLogos = await page.locator("[data-brand-logo]").evaluateAll((nodes) =>
    nodes.map((node) => ({ alt: node.getAttribute("alt"), src: node.getAttribute("src") })),
  );
  assert.ok(chineseLogos.length > 0, `${viewport.name}: Chinese logo count`);
  assert.ok(chineseLogos.every((logo) => logo.alt === "颗秒 OneTap"), `${viewport.name}: Chinese logo alt`);
  assert.ok(chineseLogos.every((logo) => logo.src?.endsWith("brand-onetap-zh.webp")), `${viewport.name}: Chinese logos`);
  await assertLayout(page, `${viewport.name}/zh`);

  const languageEvents = await page.evaluate(() =>
    window.dataLayer.filter((event) => event.event === "language_change").map((event) => event.lang),
  );
  assert.deepEqual(languageEvents.slice(-2), ["en", "zh"], `${viewport.name}: language analytics`);

  await loadLazyImages(page);
  const unloadedImages = await page.locator("img").evaluateAll((images) =>
    images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute("src")),
  );
  assert.deepEqual(unloadedImages, [], `${viewport.name}: unloaded images`);

  if (process.env.CAPTURE_SCREENSHOTS === "1") {
    await page.screenshot({ path: `_verify-${viewport.name}.png`, fullPage: true });
  }
  assert.equal(browserErrors.length, 0, `${viewport.name}: ${browserErrors.join("; ")}`);
  await context.close();
}

const server = createStaticServer();
const port = await listen(server);
const browser = await chromium.launch({ headless: true });

try {
  const baseUrl = `http://127.0.0.1:${port}/`;
  for (const viewport of viewports) await validateViewport(browser, baseUrl, viewport);
  console.log(JSON.stringify({ viewports: viewports.map((viewport) => viewport.name), failures: 0 }, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
