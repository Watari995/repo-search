// @vitest-environment node

/**
 * `toRepository` / `toRepositoryDetail` の単体テスト。
 *
 * snake_case → camelCase の変換は「機械的に正しいか」を確認する地味だが
 * 保証価値の高いテスト。値の取り違えはランタイムでも気づきにくい。
 *
 * 特に `toRepositoryDetail` の watcher 数取り扱いは GitHub API のドメイン知識を
 * 反映する **本リポジトリで最重要のテスト**。詳細は normalize.ts のコメント参照。
 */
import { describe, expect, it } from "vitest";
import {
  toRepository,
  toRepositoryDetail,
  type GitHubRepoFull,
  type GitHubSearchRepoItem,
} from "./normalize";

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

const detailFixture: GitHubRepoFull = {
  ...fixture,
  // GitHub API の罠を再現するため stars と watchers_count を **同値** に。
  // 実 API もこの形を返す。
  watchers_count: 230_000,
  // 真の watcher 数 (=Subscribe 数) は別途 subscribers_count に入る。
  subscribers_count: 6_500,
};

describe("toRepositoryDetail (★watcher_count の罠)", () => {
  it("Watcher 数は subscribers_count を採用する (watchers_count ではない)", () => {
    // この 1 行が本リポジトリの最重要アサーション。
    // 仕様: GET /repos/{owner}/{repo} の watchers_count は実態として
    //       stargazers_count と同値を返すため信頼してはいけない。
    //       本来の Watcher 数は subscribers_count にある。
    const detail = toRepositoryDetail(detailFixture);

    expect(detail.watchersCount).toBe(6_500);
    expect(detail.watchersCount).not.toBe(detailFixture.watchers_count);
    expect(detail.starsCount).toBe(230_000);
  });

  it("Repository ベースのフィールドも正しく引き継がれる", () => {
    const detail = toRepositoryDetail(detailFixture);
    expect(detail.fullName).toBe("facebook/react");
    expect(detail.starsCount).toBe(230_000);
    expect(detail.forksCount).toBe(47_000);
    expect(detail.openIssuesCount).toBe(1_200);
  });

  it("subscribers_count が 0 でもそのまま 0 を返す (フォールバックで stars に戻さない)", () => {
    // 「0 が来たから watchers_count に fallback する」ような罠を入れない保険。
    const detail = toRepositoryDetail({ ...detailFixture, subscribers_count: 0 });
    expect(detail.watchersCount).toBe(0);
  });

  it("watchers_count と subscribers_count が等しいケース (個人リポジトリ等) でも subscribers_count を採用", () => {
    const detail = toRepositoryDetail({
      ...detailFixture,
      watchers_count: 12,
      subscribers_count: 12,
    });
    expect(detail.watchersCount).toBe(12);
  });
});
