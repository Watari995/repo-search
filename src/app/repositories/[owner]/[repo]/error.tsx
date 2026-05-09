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
      className="flex flex-col items-center gap-3 rounded-md border border-danger-fg/40 bg-danger-subtle p-8 text-center text-fg-default"
    >
      <AlertIcon size={32} className="text-danger-fg" aria-hidden />
      <h2 className="text-lg font-semibold">Failed to load repository</h2>
      <p className="max-w-md text-sm text-fg-muted">
        詳細情報の取得に失敗しました。時間をおいて再度お試しください。
      </p>
      {error.digest && <p className="font-mono text-xs text-fg-subtle">digest: {error.digest}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-8 items-center rounded-md border border-border-default px-4 text-sm font-medium text-fg-default transition-colors hover:bg-neutral-muted focus-visible:outline-2 focus-visible:outline-accent-fg"
        >
          Try again
        </button>
        <Link
          href="/repositories"
          className="inline-flex h-8 items-center rounded-md border border-border-default px-4 text-sm font-medium text-fg-default transition-colors hover:bg-neutral-muted"
        >
          Back to search
        </Link>
      </div>
    </div>
  );
}
