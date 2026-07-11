import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".txt",
  ".webmanifest",
  ".xml",
  ".yaml",
  ".yml",
]);
const output = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: root, encoding: "utf8" },
);
const files = output.split("\0").filter(Boolean).filter((file) => textExtensions.has(path.extname(file)));
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  content.split(/\r?\n/).forEach((line, index) => {
    if (/[\t ]+$/.test(line)) failures.push(`${file}:${index + 1}: trailing whitespace`);
  });
  if (!content.endsWith("\n")) failures.push(`${file}: missing final newline`);
  if (/\r?\n\r?\n$/.test(content)) failures.push(`${file}: blank line at end of file`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({ checkedTextFiles: files.length, failures: 0 }, null, 2));
