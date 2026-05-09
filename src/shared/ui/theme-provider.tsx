"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes の Provider をクライアント境界に切り出したラッパ。
 *
 * - `attribute="class"`: <html> に `dark` クラスを付け外しする方式。
 *   Tailwind v4 の `@custom-variant dark (&:where(.dark, .dark *))` と整合する。
 * - `defaultTheme="system"` + `enableSystem`: システム設定に追従しつつ
 *   ユーザが明示的に切り替えた値は localStorage に保存される。
 * - `disableTransitionOnChange`: テーマ切替時の色のフェード遷移を抑止し、
 *   切替時のチカチカ感を排除する (GitHub UI と同じ印象)。
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
