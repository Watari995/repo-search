// @vitest-environment node

/**
 * `getRepository` の結合テスト。
 *
 * - URL の組み立てが encodeURIComponent を通っていること (owner に "." 等を含む組織名対策)
 * - 404 が NotFoundError として伝播すること (page.tsx で notFound() に流すため)
 * - watcher_count の罠への対応が結合レベルでも保たれていること
 */
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../../../../tests/mocks/server";
import { NotFoundError } from "./errors";
import { getRepository } from "./get-repository";

describe("getRepository", () => {
  it("/repos/{owner}/{repo} を組み立てて結果を整形する", async () => {
    server.use(
      http.get("https://api.github.com/repos/facebook/react", () =>
        HttpResponse.json({
          id: 1,
          full_name: "facebook/react",
          name: "react",
          owner: { login: "facebook", avatar_url: "https://example.invalid/a.png" },
          description: "Lib",
          language: "JavaScript",
          stargazers_count: 100,
          forks_count: 10,
          open_issues_count: 5,
          html_url: "https://github.com/facebook/react",
          updated_at: "2026-04-01T00:00:00Z",
          watchers_count: 100,
          subscribers_count: 7,
        }),
      ),
    );

    const detail = await getRepository("facebook", "react");

    expect(detail.fullName).toBe("facebook/react");
    // 結合レベルでも subscribers_count → watchersCount のマッピングを表明する
    expect(detail.watchersCount).toBe(7);
    expect(detail.starsCount).toBe(100);
  });

  it("404 は NotFoundError として伝播する", async () => {
    server.use(
      http.get("https://api.github.com/repos/none/none", () =>
        HttpResponse.json({ message: "Not Found" }, { status: 404 }),
      ),
    );

    await expect(getRepository("none", "none")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("owner / repo をエンコードする (組織名のドットや空白対策)", async () => {
    let calledUrl = "";
    server.use(
      http.get("https://api.github.com/repos/:owner/:repo", ({ request }) => {
        calledUrl = new URL(request.url).pathname;
        return HttpResponse.json({
          id: 1,
          full_name: "a.b/c d",
          name: "c d",
          owner: { login: "a.b", avatar_url: "" },
          description: null,
          language: null,
          stargazers_count: 0,
          forks_count: 0,
          open_issues_count: 0,
          html_url: "",
          updated_at: "2026-01-01T00:00:00Z",
          watchers_count: 0,
          subscribers_count: 0,
        });
      }),
    );

    await getRepository("a.b", "c d");
    expect(calledUrl).toBe("/repos/a.b/c%20d");
  });
});
