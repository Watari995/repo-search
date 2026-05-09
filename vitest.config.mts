import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/**
 * Vitest 設定。
 *
 * - 拡張子は `.mts` を採用。Vite + Node 24 + Vitest で `.ts` のときに
 *   require(ESM) パスを通って `ERR_REQUIRE_ESM` が出るため、ESM ローダ確定の
 *   `.mts` にしている。`.ts` でも機能上同等だが、現環境ではこの方が安全。
 * - `environment: "jsdom"` でブラウザ DOM を模倣 (RTL を使うため)。
 *   純関数だけ叩くテストはファイル先頭の `// @vitest-environment node`
 *   で個別に override する想定。
 * - `globals: true` により `describe / it / expect` を import なしで使える。
 * - Next.js の `@/` alias を解決するため tsconfig と同じ paths を設定。
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/unit/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/app/**/{layout,error,loading,not-found}.tsx",
        "src/**/index.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
