"use client";

import { AlertIcon } from "@primer/octicons-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * 詳細ページのエラーバウンダリ。
 *
 * `notFound()` 経由の 404 はここに来ない (Next.js が `not-found.tsx` に流す)。
 * ここに来るのはレート制限以外の予期しないエラー。
 * reset と並んで「一覧に戻る」ナビも出すことで、ユーザを行き止まりにしない。
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="border-danger-fg/40 bg-danger-subtle text-fg-default flex flex-col items-center gap-3 rounded-md border p-8 text-center"
    >
      <AlertIcon size={32} className="text-danger-fg" aria-hidden />
      <h2 className="text-lg font-semibold">Failed to load repository</h2>
      <p className="text-fg-muted max-w-md text-sm">
        詳細情報の取得に失敗しました。時間をおいて再度お試しください。
      </p>
      {error.digest && (
        <p className="text-fg-subtle font-mono text-xs">digest: {error.digest}</p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="border-border-default text-fg-default hover:bg-neutral-muted focus-visible:outline-accent-fg inline-flex h-8 items-center rounded-md border px-4 text-sm font-medium transition-colors focus-visible:outline-2"
        >
          Try again
        </button>
        <Link
          href="/repositories"
          className="border-border-default text-fg-default hover:bg-neutral-muted inline-flex h-8 items-center rounded-md border px-4 text-sm font-medium transition-colors"
        >
          Back to search
        </Link>
      </div>
    </div>
  );
}
