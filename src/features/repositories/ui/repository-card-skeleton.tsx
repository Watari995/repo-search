import { Skeleton } from "@/shared/ui/skeleton";

/**
 * RepositoryCard と寸法を揃えた skeleton。
 * loading.tsx で 5 件ほど縦に並べると、検索開始から結果表示までのレイアウトシフトを抑えられる。
 */
export function RepositoryCardSkeleton() {
  return (
    <div className="border-border-muted bg-canvas-default rounded-md border p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
          <div className="flex gap-3 pt-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
