import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.e2e.ts",
  use: { baseURL: "http://127.0.0.1:3180", trace: "retain-on-failure" },
  webServer: {
    command:
      "bunx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 3180 --strictPort",
    url: "http://127.0.0.1:3180/tests/browser/index.html",
    reuseExistingServer: false,
  },
});
