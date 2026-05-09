"use client";

import { SearchIcon } from "@primer/octicons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, type SyntheticEvent } from "react";

/**
 * 検索バー。
 *
 * 設計の要点:
 *   - URL = State の方針に従い、submit 時は URL を `?q=...` に push するだけ。
 *     Server Component (`/repositories/page.tsx`) が searchParams を読み直して
 *     再レンダーする。検索結果のクライアント状態は持たない。
 *   - `<form action="/repositories" method="GET">` をベースに onSubmit を上書き。
 *     JS 無効でも native の form submission で URL に q が乗るので動く。
 *   - クエリ変更時は page を URL から落とす (検索すると 1 ページ目に戻すのが
 *     直感に合う)。
 *   - `useTransition` で navigation を transition として扱い、入力欄の
 *     インタラクティビティを保つ (React 19 + App Router の推奨パターン)。
 */
export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  // 戻る/進む等で URL が変わったとき、入力値を同期する (URL → UI)。
  // 外部状態 (URL) との同期であり、cascading render の警告対象とは目的が違う。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL→UI の同期
    setValue(initialQuery);
  }, [initialQuery]);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed === "") {
      // 空クエリは URL を変更しない (空 push でブラウザ履歴を汚さない)。
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set("q", trimmed);
    params.delete("page");
    startTransition(() => {
      router.push(`/repositories?${params.toString()}`);
    });
  }

  return (
    <form
      role="search"
      action="/repositories"
      method="GET"
      onSubmit={handleSubmit}
      className="flex flex-1 items-center gap-2"
    >
      <label htmlFor="repo-search-input" className="sr-only">
        Search repositories
      </label>
      <div className="flex flex-1 items-center gap-2 rounded-md border border-border-default bg-canvas-subtle px-3 py-1.5 text-fg-default transition focus-within:border-accent-fg focus-within:ring-2 focus-within:ring-accent-fg/30">
        <SearchIcon size={16} className="text-fg-muted" />
        <input
          id="repo-search-input"
          name="q"
          type="search"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="Search repositories..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-fg-subtle"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-8 items-center justify-center rounded-md bg-success-fg px-4 text-sm font-medium text-fg-on-emphasis transition-colors hover:bg-success-fg/90 focus-visible:outline-2 focus-visible:outline-accent-fg disabled:opacity-60"
      >
        Search
      </button>
    </form>
  );
}
