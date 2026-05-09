/**
 * URL の searchParams を SearchQuery 値オブジェクトに正規化する純関数群。
 *
 * 「URL = State」を貫くため、UI 層 (検索バー / ページネーション) は
 * すべて URL を更新するだけで良い設計。Server Component はここで
 * URL を受け取り、SearchQuery に変換してから検索 API を叩く。
 *
 * - GitHub Search API は q=空文字 で 422 を返すため、
 *   `isEmpty` で早期 return できるよう discriminated union にしている。
 * - per_page / 最大件数は GitHub Search API の制約に合わせる。
 */

/** 1ページあたりの件数。GitHub UI と近く描画コストも抑えられる値。 */
export const PER_PAGE = 20;

/** GitHub Search API の上限 (1000件)。 */
export const MAX_RESULTS = 1000;

/** 上限に対応する最大ページ番号。 */
export const MAX_PAGE = Math.floor(MAX_RESULTS / PER_PAGE);

export type SearchQuery =
  | { isEmpty: true }
  | { isEmpty: false; q: string; page: number };

export type SearchParamsLike = {
  q?: string | string[];
  page?: string | string[];
};

/**
 * Next.js の `searchParams` から SearchQuery を作る。
 *
 * - 配列値が来た場合は先頭を採用する (`?q=a&q=b` への保険)。
 * - 半角空白だけのクエリは空扱いにする。
 * - page が NaN や負数の場合は 1 にクリップする。
 * - 上限超過 (page > MAX_PAGE) は MAX_PAGE にクリップする。
 */
export function parseSearchQuery(input: SearchParamsLike): SearchQuery {
  const q = pickFirst(input.q)?.trim() ?? "";
  if (q === "") {
    return { isEmpty: true };
  }

  const rawPage = pickFirst(input.page);
  const page = clampPage(Number.parseInt(rawPage ?? "", 10));

  return { isEmpty: false, q, page };
}

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function clampPage(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > MAX_PAGE) return MAX_PAGE;
  return Math.floor(n);
}

/**
 * 検索結果の totalCount からページ総数を算出する。
 * Search API の上限 (1000件) を超えないようクリップする。
 */
export function calculateTotalPages(totalCount: number): number {
  if (totalCount <= 0) return 0;
  const cappedTotal = Math.min(totalCount, MAX_RESULTS);
  return Math.max(1, Math.ceil(cappedTotal / PER_PAGE));
}
