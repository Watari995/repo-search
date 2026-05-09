import type { Repository, RepositoryDetail } from "./repository";

/**
 * GitHub Search API の検索結果アイテム (使うフィールドのみ宣言)。
 *
 * 完全な型は `@octokit/openapi-types` から得られるが依存増やしたくないので、
 * 必要なフィールドだけ手で記述する。命名は API のまま (snake_case) を維持し、
 * 正規化関数 `toRepository` で DTO に詰め替える。
 */
export type GitHubSearchRepoItem = {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  updated_at: string;
};

/**
 * GitHub の検索結果 1 件を `Repository` DTO に正規化する。
 *
 * 設計方針:
 *   - snake_case → camelCase に揃える (UI 側で API の癖を意識しなくて済む)
 *   - `description` / `language` の `null` はそのまま維持。
 *     呼び出し側で「言語不明」の表示に分岐できるようにする。
 *   - 純関数として書き、テストでは入出力をそのまま検証する。
 */
export function toRepository(raw: GitHubSearchRepoItem): Repository {
  return {
    id: raw.id,
    fullName: raw.full_name,
    name: raw.name,
    owner: {
      login: raw.owner.login,
      avatarUrl: raw.owner.avatar_url,
    },
    description: raw.description,
    language: raw.language,
    starsCount: raw.stargazers_count,
    forksCount: raw.forks_count,
    openIssuesCount: raw.open_issues_count,
    htmlUrl: raw.html_url,
    updatedAt: raw.updated_at,
  };
}

/**
 * `/repos/{owner}/{repo}` のレスポンス。
 * 詳細ページで必要なフィールドだけ宣言する。
 */
export type GitHubRepoFull = GitHubSearchRepoItem & {
  watchers_count: number;
  subscribers_count: number;
};

/**
 * リポジトリ詳細を `RepositoryDetail` DTO に正規化する。
 *
 * 単純に Repository に watchersCount を足しているだけ。
 * watchers_count フィールドをそのまま使う。
 */
export function toRepositoryDetail(raw: GitHubRepoFull): RepositoryDetail {
  return {
    ...toRepository(raw),
    watchersCount: raw.watchers_count,
  };
}
