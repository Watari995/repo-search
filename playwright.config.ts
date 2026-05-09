import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright 設定。
 *
 * - testDir: tests/e2e のみを対象 (vitest と分離)
 * - webServer: `pnpm build && pnpm start` を起動。dev でも OK だが prod 相当の
 *   挙動 (キャッシュ・最適化) を見るためにビルド後の next start を使う
 * - reuseExistingServer: ローカルでは既に立ち上げたサーバを使い回せる。CI では
 *   必ず新規起動する
 * - 1 ブラウザ (chromium) のみ。マルチブラウザは試験範囲を逸脱
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec next build && pnpm exec next start --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Basic Auth は E2E では無効化する (env 未設定なら proxy.ts は素通し)
    env: {
      BASIC_AUTH_USER: "",
      BASIC_AUTH_PASSWORD: "",
    },
  },
});
