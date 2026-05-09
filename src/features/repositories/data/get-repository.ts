import "server-only";

import { toRepositoryDetail, type GitHubRepoFull } from "../domain/normalize";
import type { RepositoryDetail } from "../domain/repository";
import { githubFetch } from "./github-client";

/**
 * `/repos/{owner}/{repo}` を叩いて単一リポジトリの詳細を取得する。
 *
 * - 詳細ページは更新頻度がそこまで高くないので revalidate を 300 秒に設定。
 *   人気リポジトリは数値変化があってもユーザ視点では誤差レベル。
 * - 404 / 401 / レート制限などは github-client が ドメイン例外に詰め替えた
 *   状態で投げてくるので、ここでは catch しない (上位の page で扱う)。
 */
export async function getRepository(owner: string, repo: string): Promise<RepositoryDetail> {
  const data = await githubFetch<GitHubRepoFull>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { next: { revalidate: 300 } },
  );
  return toRepositoryDetail(data);
}
