import { RepositoryCardSkeleton } from "@/features/repositories/ui/repository-card-skeleton";

/**
 * App Router の `loading.tsx` 規約。
 *
 * 同階層の `page.tsx` が `await` する間に Suspense fallback として表示される。
 * これにより、ヘッダ・検索バーは即時インタラクティブで、結果領域だけが
 * Streaming で差し替わる UX になる (Next.js v16 の Streaming + Suspense の活用)。
 */
export default function Loading() {
  return (
    <section className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="h-4 w-48 animate-pulse rounded bg-neutral-muted" aria-hidden />
      <ul className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          // index を key にしているのは、骨組みの並び順そのものに意味がないため
          <li key={index}>
            <RepositoryCardSkeleton />
          </li>
        ))}
      </ul>
    </section>
  );
}
