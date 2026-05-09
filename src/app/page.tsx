import { redirect } from "next/navigation";

/**
 * ルートはアプリの主機能である `/repositories` へ恒久リダイレクトする。
 *
 * `redirect()` は Server Component から呼ぶ React の RSC API。
 * 内部的に NEXT_REDIRECT エラーを投げて HTTP 308 (永続的) を発行する。
 * SEO 的にも `next/link` の prefetch 観点でもこのアプローチが標準。
 */
export default function Home() {
  redirect("/repositories");
}
