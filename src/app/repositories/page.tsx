import { RateLimitError } from "@/features/repositories/data/errors";
import { searchRepositories } from "@/features/repositories/data/search-repositories";
import { calculateTotalPages, parseSearchQuery } from "@/features/repositories/domain/search-query";
import { EmptyState } from "@/features/repositories/ui/empty-state";
import { Pagination } from "@/features/repositories/ui/pagination";
import { RateLimitNotice } from "@/features/repositories/ui/rate-limit-notice";
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

  // レート制限はユーザに「あと何分で再試行できる」を提示したいため、
  // ここで catch して専用 UI に流す。それ以外の例外は error.tsx に伝播させる。
  let result;
  try {
    result = await searchRepositories(query);
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Server Component は 1 リクエストごとに 1 回しか走らないため
      // Date.now() を「描画関数で呼ぶこと」自体は不安定さを生まない。
      // react-hooks/purity の警告は CSR を想定したもので、ここでは無効化する。
      // eslint-disable-next-line react-hooks/purity -- Server Component, request scoped
      const now = Date.now();
      const minutesUntilReset = error.resetAt
        ? Math.max(0, Math.ceil((error.resetAt.getTime() - now) / 60_000))
        : null;
      return <RateLimitNotice minutesUntilReset={minutesUntilReset} />;
    }
    throw error;
  }

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
