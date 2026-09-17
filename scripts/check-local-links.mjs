import fs from "node:fs";
import path from "node:path";

const appRoot = path.resolve("src/app");
const sourceRoot = path.resolve("src");

function filesUnder(directory, predicate) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...filesUnder(absolute, predicate));
    else if (predicate(absolute)) result.push(absolute);
  }
  return result;
}

const pagePatterns = filesUnder(appRoot, (file) => file.endsWith(`${path.sep}page.tsx`)).map((file) => {
  const relative = path.relative(appRoot, path.dirname(file)).replaceAll("\\", "/");
  const route = relative.split("/").filter((part) => !/^\(.+\)$/.test(part)).join("/");
  const escaped = route
    .split("/")
    .map((part) => (part.startsWith("[") ? "[^/]+" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
    .join("/");
  return new RegExp(`^/${escaped}/?$`);
});

const missing = [];
for (const file of filesUnder(sourceRoot, (name) => /\.(?:ts|tsx)$/.test(name))) {
  const text = fs.readFileSync(file, "utf8");
  const expressions = [
    ...text.matchAll(/href\s*=\s*["'](\/[^"'#?]*)/g),
    ...text.matchAll(/(?:redirect|router\.push|router\.replace)\(\s*["'](\/[^"'#?]*)/g),
  ];
  for (const match of expressions) {
    const target = match[1];
    if (target.startsWith("/api/") || pagePatterns.some((pattern) => pattern.test(target))) continue;
    missing.push(`${path.relative(process.cwd(), file)} -> ${target}`);
  }
}

if (missing.length) {
  console.error(`Missing local route targets:\n${[...new Set(missing)].join("\n")}`);
  process.exit(1);
}
console.log(`PASS local route targets (${pagePatterns.length} page patterns)`);
