import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * フォントは next/font/google で self-host する。
 * サードパーティ通信を排除して CLS を防ぎ、必要な weight だけバンドルに乗せる
 * (Inter は GitHub の実フォント、JetBrains Mono はリポジトリ名の等幅表示用)。
 *
 * variable に渡した CSS 変数を Tailwind 側で `--font-sans` / `--font-mono` に
 * 別名付けすることで `font-sans` / `font-mono` ユーティリティから使える。
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * App Router の Metadata API。
 * - title.template により詳細ページで `<repo> · repo-search` のような形にできる
 * - metadataBase は OGP 画像の絶対 URL 解決に必要。本番ドメインは Phase 5 で差し替える
 */
export const metadata: Metadata = {
  title: {
    default: "repo-search",
    template: "%s · repo-search",
  },
  description: "Search GitHub repositories with a Next.js 16 App Router demo.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // next-themes が hydration 時に <html> へクラスを差し込むため
  // mismatch 警告を抑制する。これは公式が推奨するパターン。
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-svh flex-col bg-canvas-default font-sans text-fg-default">
        {children}
      </body>
    </html>
  );
}
