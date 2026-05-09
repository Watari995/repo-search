import { ChevronLeftIcon, ChevronRightIcon } from "@primer/octicons-react";
import Link from "next/link";

/**
 * URL 駆動のページネーション。
 *
 * 設計の要点:
 *   - `<Link href={...}>` を並べるだけ。クライアント状態を一切持たない。
 *     Next.js が viewport 内 Link を自動 prefetch するため遷移は速い。
 *   - 現在ページや disable 状態は `<span>` にして href を持たせない
 *     (キーボード/スクリーンリーダーに「行けない」ことを伝える aria-disabled も付与)。
 *   - "1, ..., 4, 5, [6], 7, 8, ..., 50" の形式は GitHub と一緒。
 *     コアロジックの `buildPageItems` は純関数として切り出してテスト可能にする。
 *   - totalPages <= 1 のときは描画しない (UI ノイズ削減)。
 */

type PageItem = number | "ellipsis";

export function Pagination({
  currentPage,
  totalPages,
  q,
}: {
  currentPage: number;
  totalPages: number;
  q: string;
}) {
  if (totalPages <= 1) return null;

  const items = buildPageItems(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-1">
      <NavLink
        href={currentPage > 1 ? buildHref(q, currentPage - 1) : null}
        ariaLabel="Previous page"
      >
        <ChevronLeftIcon size={16} aria-hidden />
        <span>Prev</span>
      </NavLink>

      <ol className="flex items-center gap-1" aria-label="Page list">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li
              key={`ellipsis-${index}`}
              aria-hidden
              className="text-fg-subtle px-2 text-sm"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <PageLink
                page={item}
                href={buildHref(q, item)}
                isCurrent={item === currentPage}
              />
            </li>
          ),
        )}
      </ol>

      <NavLink
        href={currentPage < totalPages ? buildHref(q, currentPage + 1) : null}
        ariaLabel="Next page"
      >
        <span>Next</span>
        <ChevronRightIcon size={16} aria-hidden />
      </NavLink>
    </nav>
  );
}

function PageLink({
  page,
  href,
  isCurrent,
}: {
  page: number;
  href: string;
  isCurrent: boolean;
}) {
  if (isCurrent) {
    return (
      <span
        aria-current="page"
        className="bg-accent-emphasis text-fg-on-emphasis inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium"
      >
        {page}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="text-fg-default hover:bg-neutral-muted border-border-muted inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors"
    >
      {page}
    </Link>
  );
}

function NavLink({
  href,
  children,
  ariaLabel,
}: {
  href: string | null;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  if (href === null) {
    return (
      <span
        aria-disabled="true"
        aria-label={ariaLabel}
        className="border-border-muted text-fg-subtle inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-md border px-3 text-sm"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="border-border-muted text-fg-default hover:bg-neutral-muted inline-flex h-8 items-center gap-1 rounded-md border px-3 text-sm transition-colors"
    >
      {children}
    </Link>
  );
}

function buildHref(q: string, page: number): string {
  const params = new URLSearchParams();
  params.set("q", q);
  if (page > 1) {
    // page=1 は URL から省く (検索バーが page を delete するのと整合)
    params.set("page", String(page));
  }
  return `/repositories?${params.toString()}`;
}

/**
 * 純関数。`generatePageItems(6, 50)` は `[1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 50]`
 * のような配列を返す。GitHub のページネーションと近い見た目。
 *
 * - 常に 1 と末尾を表示
 * - 現在ページの前後 2 つを表示
 * - 隣接ページ (ギャップが 1 以下) には ellipsis を入れない
 */
export function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
  const visible = new Set<number>();
  const candidates = [
    1,
    totalPages,
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
  for (const candidate of candidates) {
    if (candidate >= 1 && candidate <= totalPages) {
      visible.add(candidate);
    }
  }

  const sorted = [...visible].sort((a, b) => a - b);
  const result: PageItem[] = [];
  let prev = 0;
  for (const page of sorted) {
    if (page > prev + 1) {
      result.push("ellipsis");
    }
    result.push(page);
    prev = page;
  }
  return result;
}
