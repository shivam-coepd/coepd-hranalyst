import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/app");
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name === "page.tsx" || entry.name === "route.ts") files.push(absolute);
  }
}

walk(root);
const routes = files
  .map((absolute) => {
    const relative = path.relative(root, absolute).replaceAll("\\", "/");
    const segments = relative.split("/").slice(0, -1).filter((x) => !/^\(.+\)$/.test(x));
    const route = `/${segments.join("/")}`.replace(/\/$/, "") || "/";
    const first = segments[0] ?? "public";
    const audience = ["admin", "placement-hr", "client", "student"].includes(first)
      ? first
      : first === "api"
        ? "server-authorized"
        : "public-or-account-state";
    return { route, kind: absolute.endsWith("route.ts") ? "api" : "page", audience, source: relative };
  })
  .sort((a, b) => a.route.localeCompare(b.route) || a.kind.localeCompare(b.kind));

fs.writeFileSync("docs/ROUTE_MATRIX.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2)}\n`);
console.log(`Generated route matrix with ${routes.length} routes`);
