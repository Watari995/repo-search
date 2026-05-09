"use client";

import { ArrowLeftIcon } from "@primer/octicons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SyntheticEvent } from "react";

/**
 * 詳細ページの「Back to results」ナビゲーション。
 *
 * 設計の意図:
 *   - 検索結果から遷移してきた場合は `router.back()` で同じ ?q=...&page=...
 *     の位置に戻したい。
 *   - 直接 (詳細ページの URL を踏んだ) アクセスの場合は履歴がないので
 *     /repositories へフォールバック。
 *   - JS 無効環境でも動くよう base には実 href (`/repositories`) を持たせる
 *     プログレッシブエンハンスメント。
 */
export function BackToResults() {
  const router = useRouter();

  function handleClick(event: SyntheticEvent<HTMLAnchorElement>) {
    // history.length は SSR/初回 CSR で安定値ではないが、クリック時には
    // window が存在する。SPA 内遷移なら 1 を超えるはず。
    if (typeof window !== "undefined" && window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href="/repositories"
      onClick={handleClick}
      className="inline-flex w-fit items-center gap-1 text-sm text-fg-muted transition-colors hover:text-accent-fg"
    >
      <ArrowLeftIcon size={14} aria-hidden />
      Back to results
    </Link>
  );
}
