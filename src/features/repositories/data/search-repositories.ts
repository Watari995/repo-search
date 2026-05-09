import "server-only";

import { toRepository, type GitHubSearchRepoItem } from "../domain/normalize";
import type { Repository } from "../domain/repository";
import { PER_PAGE, type SearchQuery } from "../domain/search-query";
import { githubFetch } from "./github-client";

type SearchRepositoriesResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchRepoItem[];
};

export type SearchResult = {
  totalCount: number;
  items: Repository[];
};

/**
 * GitHub Search API を叩いてリポジトリを検索する。
 *
 * - 空クエリ (`isEmpty: true`) は早期 return。GitHub に投げると 422 を返してくる。
 * - sort=stars / order=desc 固定。GitHub Web 検索のデフォルトに合わせる。
 * - revalidate: 60 秒。同一クエリの連続アクセスでレート制限を消費しない。
 *   (人気クエリほど CDN ヒット率が高くなる)
 */
export async function searchRepositories(query: SearchQuery): Promise<SearchResult> {
  if (query.isEmpty) {
    return { totalCount: 0, items: [] };
  }

  const params = new URLSearchParams({
    q: query.q,
    sort: "stars",
    order: "desc",
    per_page: String(PER_PAGE),
    page: String(query.page),
  });

  const data = await githubFetch<SearchRepositoriesResponse>(
    `/search/repositories?${params.toString()}`,
    { next: { revalidate: 60 } },
  );

  return {
    totalCount: data.total_count,
    items: data.items.map(toRepository),
  };
}
