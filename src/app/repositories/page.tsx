import { searchRepositories } from "@/features/repositories/data/search-repositories";
import {
  calculateTotalPages,
  parseSearchQuery,
} from "@/features/repositories/domain/search-query";
import { EmptyState } from "@/features/repositories/ui/empty-state";
import { Pagination } from "@/features/repositories/ui/pagination";
import { RepositoryList } from "@/features/repositories/ui/repository-list";

/**
 * 検索結果一覧 (Server Component)。
 *
 * Next.js v15+ では `searchParams` が `Promise<...>` 型 (Async Request APIs)。
 * await してから使う。`PageProps<'/repositories'>` は next typegen が生成する
 * グローバルヘルパーで、URL リテラルから params/searchParams を厳密に型付けする。
 *
 * 設計のポイント:
 *   - URL の searchParams を SearchQuery に正規化するのは domain 側の責務。
 *     ここは「URL → use case → UI」の配線だけに留めて 20 行前後で収める。
 *   - 空クエリ時は API を叩かない。「初期表示」と「0 件ヒット」も別 UI に分岐。
 *   - データ層から伝播する例外 (RateLimitError 等) は `error.tsx` で受ける。
 */
export default async function Page(props: PageProps<"/repositories">) {
  const searchParams = await props.searchParams;
  const query = parseSearchQuery(searchParams);

  if (query.isEmpty) {
    return <EmptyState mode="initial" />;
  }

  const result = await searchRepositories(query);

  if (result.totalCount === 0) {
    return <EmptyState mode="not-found" query={query.q} />;
  }

  const totalPages = calculateTotalPages(result.totalCount);

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted" aria-live="polite">
        {result.totalCount.toLocaleString("en-US")} repository results
      </p>
      <RepositoryList items={result.items} />
      <Pagination currentPage={query.page} totalPages={totalPages} q={query.q} />
    </section>
  );
}
