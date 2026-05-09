// @vitest-environment node

/**
 * `toRepository` の単体テスト。
 *
 * snake_case → camelCase の変換は「機械的に正しいか」を確認する地味だが
 * 保証価値の高いテスト。値の取り違え (例: stargazers_count を forks_count に
 * 入れてしまう) はランタイムでも気づきにくい。
 *
 * 詳細ページ用の `toRepositoryDetail` は Phase 3 で導入し、
 * その際に「watcher_count の罠」テストを追加する。
 */
import { describe, expect, it } from "vitest";
import { toRepository, type GitHubSearchRepoItem } from "./normalize";

const fixture: GitHubSearchRepoItem = {
  id: 10270250,
  full_name: "facebook/react",
  name: "react",
  owner: {
    login: "facebook",
    avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
  },
  description: "The library for web and native user interfaces.",
  language: "JavaScript",
  stargazers_count: 230_000,
  forks_count: 47_000,
  open_issues_count: 1_200,
  html_url: "https://github.com/facebook/react",
  updated_at: "2026-04-01T12:34:56Z",
};

describe("toRepository", () => {
  it("snake_case を camelCase に揃え、必要なフィールドだけを抽出する", () => {
    expect(toRepository(fixture)).toEqual({
      id: 10270250,
      fullName: "facebook/react",
      name: "react",
      owner: {
        login: "facebook",
        avatarUrl: "https://avatars.githubusercontent.com/u/69631?v=4",
      },
      description: "The library for web and native user interfaces.",
      language: "JavaScript",
      starsCount: 230_000,
      forksCount: 47_000,
      openIssuesCount: 1_200,
      htmlUrl: "https://github.com/facebook/react",
      updatedAt: "2026-04-01T12:34:56Z",
    });
  });

  it("description / language の null を維持する (UI 側で fallback できるように)", () => {
    const result = toRepository({ ...fixture, description: null, language: null });
    expect(result.description).toBeNull();
    expect(result.language).toBeNull();
  });
});
