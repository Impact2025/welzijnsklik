import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          // Launch the test browser WITHOUT user extensions. The local Chrome
          // profile injects a CSP (via an adblocker/shield extension) that
          // disables eval() — which breaks Next.js dev-mode source maps / the
          // React error overlay. A clean chromium here avoids that entirely.
          ignoreDefaultArgs: ["--enable-automation"],
          args: ["--no-sandbox", "--disable-extensions", "--disable-dev-shm-usage"],
        },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    // Always spawn a dedicated server in dev too. Re-using an
    // externally-running dev-server (reuseExistingServer: true) leaves a
    // zombie `next dev` holding port 3000 after the spec run finishes.
    reuseExistingServer: !!process.env.CI,
    timeout: 30_000,
  },
});
