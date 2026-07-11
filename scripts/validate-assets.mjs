import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { collectImageRecords, validateRasterFile } from "./lib/asset-contract.mjs";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const failures = [];
const records = [];

function addRecord(ref, width, height) {
  if (!ref || !/\.(?:png|jpe?g|webp)$/i.test(ref)) return;
  records.push({ ref, width, height });
}

for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  const tag = match[0];
  const source = tag.match(/\bsrc="([^"]+)"/)?.[1];
  const width = Number(tag.match(/\bwidth="(\d+)"/)?.[1]);
  const height = Number(tag.match(/\bheight="(\d+)"/)?.[1]);
  addRecord(source, width || undefined, height || undefined);
}

for (const match of html.matchAll(/content="https:\/\/onetap\.cool\/(assets\/[^"]+\.(?:png|jpe?g|webp))"/gi)) {
  addRecord(match[1]);
}

const sandbox = { window: {} };
["src/data/metrics.js", "src/data/sections.js"].forEach((reference) => {
  const filePath = path.join(root, reference);
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), sandbox, { filename: filePath });
});
for (const item of collectImageRecords(sandbox.window)) {
  addRecord(item.image, item.width, item.height);
}

const i18nSource = fs.readFileSync(path.join(root, "src/scripts/i18n.js"), "utf8");
for (const match of i18nSource.matchAll(/"(assets\/brand-onetap-[^"]+\.webp)"/g)) {
  addRecord(match[1], 512, 512);
}

const recordsByReference = new Map();
for (const record of records) {
  const existing = recordsByReference.get(record.ref);
  if (existing && record.width && (existing.width !== record.width || existing.height !== record.height)) {
    failures.push(`${record.ref}: conflicting declared dimensions`);
  }
  recordsByReference.set(record.ref, existing?.width ? existing : record);
}

let totalBytes = 0;
for (const record of recordsByReference.values()) {
  if (!record.ref.endsWith(".webp")) failures.push(`${record.ref}: delivery reference must use WebP`);
  const filePath = path.join(root, record.ref);
  if (!fs.existsSync(filePath)) {
    failures.push(`${record.ref}: file does not exist`);
    continue;
  }
  const result = await validateRasterFile({
    filePath,
    ref: record.ref,
    declaredWidth: record.width,
    declaredHeight: record.height,
    maxWidth: record.ref.includes("brand-onetap") ? undefined : 1600,
    maxLongestEdge: record.ref.includes("brand-onetap") ? 512 : undefined,
    maxBytes: 700 * 1024,
  });
  totalBytes += result.bytes;
  failures.push(...result.failures);
}

if (totalBytes > 4 * 1024 * 1024) failures.push(`Referenced raster total exceeds 4 MB: ${totalBytes}`);

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({ rasterRefs: recordsByReference.size, rasterBytes: totalBytes }, null, 2));
