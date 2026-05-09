import { AppHeader } from "@/features/repositories/ui/app-header";

/**
 * /repositories 配下の共通レイアウト。
 *
 * App Router の `layout.tsx` は子セグメント遷移時に再レンダーされない (永続化される)。
 * そのため、ヘッダや検索バーといった「常駐 UI」をここに置くと、
 * 一覧 → 詳細 → 一覧の遷移でフォームの入力フォーカスや状態が保たれて
 * UX が一段階滑らかになる (Next.js App Router の良さの一つ)。
 */
export default function RepositoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</div>
    </>
  );
}
