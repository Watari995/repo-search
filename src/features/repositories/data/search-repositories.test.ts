// @vitest-environment node

/**
 * `searchRepositories` の結合テスト。
 *
 * - 空クエリでは API を呼ばずに空結果を返すこと (GitHub の 422 を踏まないため)
 * - レスポンスが domain DTO へ正しく整形されること
 *
 * MSW で `?q=react&page=2` のような query を表明することで、
 * ページネーションが意図通り URL に反映される単体保証を兼ねる。
 */
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../../../tests/mocks/server";
import { searchRepositories } from "./search-repositories";

const SEARCH_URL = "https://api.github.com/search/repositories";

describe("searchRepositories", () => {
  it("空クエリでは API を呼ばず空結果を返す", async () => {
    // ハンドラを登録しない = もし呼ばれたら MSW が onUnhandledRequest=error で落とす
    const result = await searchRepositories({ isEmpty: true });
    expect(result).toEqual({ totalCount: 0, items: [] });
  });

  it("検索結果を Repository DTO に整形して返す", async () => {
    server.use(
      http.get(SEARCH_URL, ({ request }) => {
        const url = new URL(request.url);
        // クエリパラメータが意図通り組み立てられているか副次的に検証
        expect(url.searchParams.get("q")).toBe("react");
        expect(url.searchParams.get("sort")).toBe("stars");
        expect(url.searchParams.get("page")).toBe("2");

        return HttpResponse.json({
          total_count: 42,
          incomplete_results: false,
          items: [
            {
              id: 1,
              full_name: "facebook/react",
              name: "react",
              owner: { login: "facebook", avatar_url: "https://example.invalid/a.png" },
              description: "A library",
              language: "JavaScript",
              stargazers_count: 100,
              forks_count: 10,
              open_issues_count: 1,
              html_url: "https://github.com/facebook/react",
              updated_at: "2026-04-01T00:00:00Z",
            },
          ],
        });
      }),
    );

    const result = await searchRepositories({ isEmpty: false, q: "react", page: 2 });

    expect(result.totalCount).toBe(42);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      fullName: "facebook/react",
      starsCount: 100,
      owner: { avatarUrl: "https://example.invalid/a.png" },
    });
  });
});
