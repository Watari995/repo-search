// @vitest-environment node

/**
 * githubFetch のエラー分岐テスト。
 *
 * 「壊れたら気づきにくい」エラーハンドリングを集中して守る。
 *   - 403 + X-RateLimit-Remaining=0 → RateLimitError (UI で残時間を出すため)
 *   - 403 (その他) → 単なる GitHubApiError
 *   - 429 もレート制限
 *   - ネットワーク失敗 → NetworkError (cause を保持)
 *
 * 上記の分岐を見落とすと、ユーザに「なぜか動かない」白画面を見せることになる。
 * MSW で HTTP 層をモックし、ステータスごとの挙動を表明する。
 */
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../../../tests/mocks/server";
import {
  GitHubApiError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "./errors";
import { githubFetch } from "./github-client";

const apiUrl = "https://api.github.com/test";

describe("githubFetch", () => {
  it("200 OK のレスポンスを JSON としてパースして返す", async () => {
    server.use(
      http.get(apiUrl, () => HttpResponse.json({ ok: true, value: 42 })),
    );

    await expect(githubFetch<{ ok: boolean; value: number }>("/test")).resolves.toEqual({
      ok: true,
      value: 42,
    });
  });

  it("401 は UnauthorizedError として投げる", async () => {
    server.use(
      http.get(apiUrl, () => HttpResponse.json({ message: "unauthorized" }, { status: 401 })),
    );

    await expect(githubFetch("/test")).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("404 は NotFoundError として投げる", async () => {
    server.use(http.get(apiUrl, () => HttpResponse.json({}, { status: 404 })));

    await expect(githubFetch("/test")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("422 は ValidationError として投げる (空クエリで GitHub が返してくる)", async () => {
    server.use(http.get(apiUrl, () => HttpResponse.json({}, { status: 422 })));

    await expect(githubFetch("/test")).rejects.toBeInstanceOf(ValidationError);
  });

  it("429 はレート制限。reset 時刻を保持する", async () => {
    const resetEpochSec = Math.floor(Date.UTC(2026, 4, 9, 12, 0, 0) / 1000);
    server.use(
      http.get(apiUrl, () =>
        HttpResponse.json(
          { message: "rate limited" },
          {
            status: 429,
            headers: { "X-RateLimit-Reset": String(resetEpochSec) },
          },
        ),
      ),
    );

    const error = await githubFetch("/test").catch((e) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).resetAt?.getTime()).toBe(resetEpochSec * 1000);
  });

  it("403 + X-RateLimit-Remaining=0 はレート制限として扱う (権限エラーと区別)", async () => {
    server.use(
      http.get(apiUrl, () =>
        HttpResponse.json(
          { message: "rate limited" },
          {
            status: 403,
            headers: { "X-RateLimit-Remaining": "0" },
          },
        ),
      ),
    );

    await expect(githubFetch("/test")).rejects.toBeInstanceOf(RateLimitError);
  });

  it("403 (rate limit ヘッダなし) は基底 GitHubApiError として扱う", async () => {
    server.use(
      http.get(apiUrl, () => HttpResponse.json({ message: "forbidden" }, { status: 403 })),
    );

    const error = await githubFetch("/test").catch((e) => e);
    expect(error).toBeInstanceOf(GitHubApiError);
    expect(error).not.toBeInstanceOf(RateLimitError);
  });

  it("ネットワーク失敗 (fetch 自体が reject) は NetworkError に詰め替える", async () => {
    server.use(http.get(apiUrl, () => HttpResponse.error()));

    const error = await githubFetch("/test").catch((e) => e);
    expect(error).toBeInstanceOf(NetworkError);
  });
});
