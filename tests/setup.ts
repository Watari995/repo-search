/**
 * Vitest のグローバルセットアップ。
 *
 * - `@testing-library/jest-dom/vitest` でカスタムマッチャ (`toBeInTheDocument` 等) を有効化。
 * - 各テストの後に MSW のハンドラをリセットし、テスト間の汚染を防ぐ。
 * - `tests/mocks/server.ts` を beforeAll で listen することで、API クライアントの
 *   テストはネットワーク到達を一切せずに済む。
 */
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

beforeAll(() => {
  // 未モックの fetch は意図しない外部到達を生むため、エラーで落として可視化する。
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
