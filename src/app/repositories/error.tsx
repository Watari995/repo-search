"use client";

import { AlertIcon } from "@primer/octicons-react";
import { useEffect } from "react";

/**
 * /repositories セグメント用のエラーバウンダリ。
 *
 * Next.js の規約で `'use client'` 必須、props は `error` と `reset`。
 * - `reset` を呼ぶと当該セグメントを再レンダーする (= Server Component の再実行)。
 *   検索のレート制限のように一時的なエラーはこれだけで復旧する。
 * - `error.digest` は Next.js が server logs と紐付けるための識別子。
 * - 個別エラー型 (RateLimitError 等) はクライアントへの転送時に prototype が
 *   失われるため、ここでは詳細分岐せず「ユーザに状況と次の操作を伝える」だけに徹する。
 *   個別 UI が必要な型 (Rate Limit の reset 時刻表示等) は page.tsx 側で
 *   try/catch して処理するのが Next.js の推奨パターン。
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 開発時のデバッグ用。production では Next.js が自動で監視に転送する。
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-md border border-danger-fg/40 bg-danger-subtle p-8 text-center text-fg-default"
    >
      <AlertIcon size={32} className="text-danger-fg" aria-hidden />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-fg-muted">
        検索結果の取得に失敗しました。時間をおいて再度お試しください。
      </p>
      {error.digest && <p className="font-mono text-xs text-fg-subtle">digest: {error.digest}</p>}
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-8 items-center rounded-md border border-border-default px-4 text-sm font-medium text-fg-default transition-colors hover:bg-neutral-muted focus-visible:outline-2 focus-visible:outline-accent-fg"
      >
        Try again
      </button>
    </div>
  );
}
