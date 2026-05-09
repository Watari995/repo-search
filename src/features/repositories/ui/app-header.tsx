import { MarkGithubIcon } from "@primer/octicons-react";
import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { SearchBar } from "./search-bar";

/**
 * GitHub 風のグローバルヘッダ。Server Component で配信できるよう静的構造のみで作る。
 *
 * - `<SearchBar>` は 'use client' で `useSearchParams()` を使うため、
 *   Suspense でラップする (Next.js が要求するパターン)。
 * - 背景は `bg-canvas-default/80 + backdrop-blur` で浮遊感を出しつつ
 *   スクロール時にコンテンツとの境界が分かる。GitHub の sticky header と近い印象。
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-canvas-default/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
        <Link
          href="/repositories"
          className="flex items-center gap-2 text-sm font-semibold text-fg-default transition-colors hover:text-accent-fg"
        >
          <MarkGithubIcon size={28} />
          <span>repo-search</span>
        </Link>
        <Suspense fallback={<div className="h-8 flex-1" aria-hidden />}>
          <SearchBar />
        </Suspense>
        <ThemeToggle />
      </div>
    </header>
  );
}
