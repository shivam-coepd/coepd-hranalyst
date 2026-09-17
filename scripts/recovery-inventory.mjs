import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root = process.cwd();
const parent = path.dirname(root);
const excluded = new Set([
  "node_modules",
  ".git",
  ".next",
  "docs",
  ".codex-ci-verify",
  "test-results",
  "playwright-report",
]);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (excluded.has(e.name) || e.name.startsWith(".env")) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const inventory = fs
  .readdirSync(parent, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => {
    const dir = path.join(parent, e.name);
    const files = walk(dir).map((p) => {
      const data = fs.readFileSync(p);
      const rel = path.relative(dir, p).replaceAll("\\", "/");
      const code = /\.(tsx?|sql|mjs|json)$/.test(p) ? data.toString() : "";
      return {
        path: rel,
        bytes: data.length,
        sha256: crypto.createHash("sha256").update(data).digest("hex"),
        ...(code
          ? {
              env: [
                ...new Set(
                  [...code.matchAll(/process\.env\.([A-Z_0-9]+)/g)].map(
                    (m) => m[1],
                  ),
                ),
              ],
              flags: [
                ...new Set(
                  [
                    ...code.matchAll(
                      /\b(?:TODO|FIXME|any)\b|not implemented|throw new Error/g,
                    ),
                  ].map((m) => m[0]),
                ),
              ],
            }
          : {}),
      };
    });
    return { directory: dir, files };
  });
fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(
  path.join(root, "docs/RECOVERY_INVENTORY.json"),
  JSON.stringify(inventory, null, 2) + "\n",
);
for (const item of inventory)
  console.log(
    path.basename(item.directory),
    item.files.length,
    "files;",
    item.files.filter((f) => f.bytes === 0).length,
    "empty",
  );
