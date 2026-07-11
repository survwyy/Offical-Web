import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { collectImageRecords, validateRasterFile } from "./lib/asset-contract.mjs";

async function withImage({ format = "webp", width = 512, height = 512 }, callback) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "onetap-asset-"));
  const filePath = path.join(directory, "fixture.webp");
  await sharp({ create: { width, height, channels: 3, background: "#111111" } })
    .toFormat(format)
    .toFile(filePath);
  try {
    await callback(filePath);
  } finally {
    await fs.rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
  }
}

test("accepts a WebP that matches its declared dimensions and budget", async () => {
  await withImage({}, async (filePath) => {
    const result = await validateRasterFile({
      filePath,
      ref: "assets/brand.webp",
      declaredWidth: 512,
      declaredHeight: 512,
      maxWidth: 512,
      maxBytes: 700 * 1024,
    });
    assert.deepEqual(result.failures, []);
  });
});

test("rejects a PNG renamed with a WebP extension", async () => {
  await withImage({ format: "png" }, async (filePath) => {
    const result = await validateRasterFile({ filePath, ref: "assets/fake.webp" });
    assert.ok(result.failures.some((failure) => failure.includes("actual format is png")));
  });
});

test("rejects dimensions that exceed the asset rule", async () => {
  await withImage({ width: 1024, height: 1024 }, async (filePath) => {
    const result = await validateRasterFile({ filePath, ref: "assets/brand.webp", maxLongestEdge: 512 });
    assert.ok(result.failures.some((failure) => failure.includes("longest edge exceeds 512")));
  });
});

test("rejects intrinsic dimensions that differ from markup", async () => {
  await withImage({}, async (filePath) => {
    const result = await validateRasterFile({
      filePath,
      ref: "assets/brand.webp",
      declaredWidth: 256,
      declaredHeight: 256,
    });
    assert.ok(result.failures.some((failure) => failure.includes("declares 256x256 but is 512x512")));
  });
});

test("rejects a portrait asset whose longest edge exceeds the rule", async () => {
  await withImage({ width: 400, height: 1000 }, async (filePath) => {
    const result = await validateRasterFile({
      filePath,
      ref: "assets/brand.webp",
      maxLongestEdge: 512,
    });
    assert.ok(result.failures.some((failure) => failure.includes("longest edge exceeds 512")));
  });
});

test("collects image records from arbitrarily nested section data", () => {
  const records = collectImageRecords({
    panels: [{ content: { image: "assets/nested.webp", width: 800, height: 600 } }],
  });
  assert.deepEqual(records, [{ image: "assets/nested.webp", width: 800, height: 600 }]);
});
