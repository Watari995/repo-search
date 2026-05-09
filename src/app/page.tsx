/**
 * ルートページの暫定実装。
 * Phase 2 で `/repositories` への redirect に置き換える。
 */
export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">repo-search</h1>
        <p className="mt-2 text-sm text-fg-muted">セットアップ中…</p>
      </div>
    </main>
  );
}
