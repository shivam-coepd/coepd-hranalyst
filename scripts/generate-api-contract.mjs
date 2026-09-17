import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/app");
const routes = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name === "route.ts") {
      const source = fs.readFileSync(absolute, "utf8");
      const relative = path.relative(root, absolute).replaceAll("\\", "/");
      const segments = relative
        .split("/")
        .slice(0, -1)
        .filter((segment) => !/^\(.+\)$/.test(segment));
      const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"].filter(
        (method) =>
          new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`).test(
            source,
          ),
      );
      const authorization = source.includes("authorizeCron")
        ? "Cron secret"
        : source.includes("requireRole") || source.includes("requireAdmin")
          ? "Authenticated role guard"
          : source.includes("requireServiceActor")
            ? "Authenticated service actor"
            : segments.join("/").startsWith("api/health")
              ? "Public health check"
              : segments.join("/").startsWith("auth/")
                ? "Supabase auth callback"
                : "Service-level authorization";
      routes.push({
        route: `/${segments.join("/")}`,
        methods: methods.join(", ") || "framework callback",
        authorization,
        source: relative,
      });
    }
  }
}

walk(root);
routes.sort((a, b) => a.route.localeCompare(b.route));

const lines = [
  "# API Contract",
  "",
  "Generated from the current Next.js route handlers. Zod schemas validate request payloads in route or service boundaries; authorization is rechecked by server services and database RPCs/RLS.",
  "",
  "| Route | Methods | Primary boundary | Source |",
  "| --- | --- | --- | --- |",
  ...routes.map(
    (route) =>
      `| \`${route.route}\` | ${route.methods} | ${route.authorization} | \`${route.source}\` |`,
  ),
  "",
  "Mutation handlers return 400 for invalid input or workflow state, 401 for missing authentication/invalid cron authorization, 403 for denied role or scope, 404 for inaccessible records where disclosure would leak existence, and masked 500 responses with a request ID for internal failures.",
  "",
];

fs.writeFileSync("docs/API_CONTRACT.md", lines.join("\n"));
console.log(`Generated API contract for ${routes.length} route handlers`);
