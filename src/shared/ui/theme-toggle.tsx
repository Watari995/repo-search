"use client";

import { MoonIcon, SunIcon } from "@primer/octicons-react";
import { useTheme } from "next-themes";

/**
 * テーマ切替ボタン。
 *
 * ポイント: SSR で `resolvedTheme` を取れないため、`mounted` 状態で初回レンダーを
 * ガードする実装が一般的だが、本コンポーネントは「両方のアイコンを描画して
 * dark クラスで CSS 表示切替」する方式を採る。利点:
 *   - useEffect + setState の cascading render が発生しない
 *     (eslint react-hooks/set-state-in-effect の警告を回避)
 *   - SSR と CSR で DOM が同一なので hydration mismatch が起きない
 *   - next-themes が <html> に注入する事前 script により FOUC も防げる
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="hover:bg-neutral-muted text-fg-default focus-visible:outline-accent-fg inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-2"
    >
      <SunIcon size={16} className="hidden dark:inline" aria-hidden />
      <MoonIcon size={16} className="inline dark:hidden" aria-hidden />
    </button>
  );
}
