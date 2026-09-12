import { spawn } from "node:child_process";
import path from "node:path";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const externalBaseUrl = process.env.E2E_BASE_URL;
const baseUrl = externalBaseUrl ?? "http://127.0.0.1:3100";
let server;

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`E2E server did not become ready at ${baseUrl}`);
}

function runPlaywright() {
  const cli = path.resolve("node_modules/@playwright/test/cli.js");
  const child = spawn(process.execPath, [cli, "test"], {
    stdio: "inherit",
    env: { ...process.env, E2E_BASE_URL: baseUrl },
  });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
}

try {
  if (!externalBaseUrl) {
    server = spawn(process.execPath, [path.resolve(".next/standalone/server.js")], {
      stdio: ["ignore", "inherit", "inherit"],
      env: { ...process.env, PORT: "3100", HOSTNAME: "127.0.0.1" },
    });
    await waitForServer();
  }
  process.exitCode = await runPlaywright();
} finally {
  server?.kill();
}
