/**
 * 検索結果一覧で扱うリポジトリ DTO の型定義。
 *
 * GitHub API の生レスポンスを直接 UI に流すと、命名規則 (snake_case) や
 * 不要フィールド (50+ プロパティ) がそのまま乗ってしまう。
 * 検索結果に必要な最小限のフィールドだけ抽出した DTO を `Repository` として定義する。
 *
 * 詳細ページ用の `RepositoryDetail` は Phase 3 で別途追加予定。
 */
export type RepositoryOwner = {
  login: string;
  avatarUrl: string;
};

export type Repository = {
  /** GitHub の repository_id。React の key に使う。 */
  id: number;
  /** "owner/repo" 形式 */
  fullName: string;
  /** "repo" 部分のみ */
  name: string;
  owner: RepositoryOwner;
  description: string | null;
  language: string | null;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  /** GitHub のリポジトリページ URL */
  htmlUrl: string;
  /** ISO8601。最終更新日時 */
  updatedAt: string;
};

/**
 * 詳細ページ用に「Watcher 数」を加えた型。
 *
 * Watcher 数の意味は GitHub API の罠を踏みやすい箇所。詳細は
 * `normalize.ts` の `toRepositoryDetail` のコメント参照。
 */
export type RepositoryDetail = Repository & {
  watchersCount: number;
};
