import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:4300/pokedex-off-fl1/",
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4300 --strictPort",
    url: "http://localhost:4300/pokedex-off-fl1/",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
