/**
 * MSW のハンドラ集約。
 *
 * Phase 1 で GitHub API クライアントのテストを書く際に、ここへ
 * 検索 / 詳細取得の代表レスポンスを追加していく。
 * ハンドラを集約しておくことで、各テストが必要なシナリオだけ
 * `server.use(...)` で上書きする運用が取りやすい。
 */
import type { HttpHandler } from "msw";

export const handlers: HttpHandler[] = [];
