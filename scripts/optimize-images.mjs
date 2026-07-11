import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const assetsDirectory = path.join(root, "assets");
const assetRules = [
  { file: "brand-onetap-en.png", width: 512, quality: 90 },
  { file: "brand-onetap-zh.png", width: 512, quality: 90 },
  { file: "screenshot-gear-compare.png", width: 1600, quality: 82 },
  { file: "screenshot-generating.png", width: 1600, quality: 82 },
  { file: "screenshot-home-arsenal.png", width: 1600, quality: 82 },
  { file: "screenshot-map-detail.png", width: 1600, quality: 82 },
  { file: "screenshot-match-history.png", width: 1600, quality: 82 },
  { file: "screenshot-personal-data.png", width: 1600, quality: 82 },
  { file: "screenshot-pro-radar.png", width: 1600, quality: 82 },
  { file: "screenshot-skin-compare.png", width: 1600, quality: 82 },
];

async function optimizeAsset(rule) {
  const sourcePath = path.join(assetsDirectory, rule.file);
  const outputName = rule.file.replace(/\.png$/i, ".webp");
  const outputPath = path.join(assetsDirectory, outputName);
  const sourceStats = await fs.stat(sourcePath);

  await sharp(sourcePath)
    .resize({ width: rule.width, withoutEnlargement: true })
    .webp({ quality: rule.quality, effort: 6, smartSubsample: true })
    .toFile(outputPath);

  const [metadata, outputStats] = await Promise.all([
    sharp(outputPath).metadata(),
    fs.stat(outputPath),
  ]);

  return {
    file: outputName,
    width: metadata.width,
    height: metadata.height,
    before: sourceStats.size,
    after: outputStats.size,
  };
}

const results = await Promise.all(assetRules.map(optimizeAsset));
const totals = results.reduce(
  (sum, result) => ({ before: sum.before + result.before, after: sum.after + result.after }),
  { before: 0, after: 0 },
);

console.log(JSON.stringify({ assets: results, totals }, null, 2));
