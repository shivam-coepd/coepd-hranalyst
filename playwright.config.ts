import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "node .next/standalone/server.js",
        url: "http://127.0.0.1:3100/api/health",
        reuseExistingServer: false,
        timeout: 60_000,
        env: {
          ...process.env,
          PORT: "3100",
          HOSTNAME: "127.0.0.1",
        },
      },
});
