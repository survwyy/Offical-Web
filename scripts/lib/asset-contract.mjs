import fs from "node:fs/promises";
import sharp from "sharp";

export async function validateRasterFile(options) {
  const {
    filePath,
    ref,
    declaredWidth,
    declaredHeight,
    maxWidth,
    maxLongestEdge,
    maxBytes,
  } = options;
  const input = await fs.readFile(filePath);
  const metadata = await sharp(input).metadata();
  const failures = [];

  if (metadata.format !== "webp") failures.push(`${ref}: actual format is ${metadata.format}`);
  if (maxWidth && metadata.width > maxWidth) failures.push(`${ref}: width exceeds ${maxWidth}`);
  if (maxLongestEdge && Math.max(metadata.width, metadata.height) > maxLongestEdge) {
    failures.push(`${ref}: longest edge exceeds ${maxLongestEdge}`);
  }
  if (maxBytes && input.length > maxBytes) failures.push(`${ref}: size exceeds ${maxBytes} bytes`);

  const hasDeclaredSize = Number.isInteger(declaredWidth) && Number.isInteger(declaredHeight);
  if (hasDeclaredSize && (metadata.width !== declaredWidth || metadata.height !== declaredHeight)) {
    failures.push(
      `${ref}: declares ${declaredWidth}x${declaredHeight} but is ${metadata.width}x${metadata.height}`,
    );
  }

  return {
    bytes: input.length,
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    failures,
  };
}

export function collectImageRecords(value, records = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectImageRecords(item, records));
    return records;
  }
  if (!value || typeof value !== "object") return records;
  if (typeof value.image === "string") records.push(value);
  Object.values(value).forEach((item) => collectImageRecords(item, records));
  return records;
}
