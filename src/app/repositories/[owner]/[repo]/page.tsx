import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotFoundError, RateLimitError } from "@/features/repositories/data/errors";
import { getRepository } from "@/features/repositories/data/get-repository";
import { RateLimitNotice } from "@/features/repositories/ui/rate-limit-notice";
import { RepositoryDetailView } from "@/features/repositories/ui/repository-detail-view";

/**
 * 動的 OGP / Twitter Card を生成する。
 *
 * - page.tsx と generateMetadata は同じ `getRepository` を呼ぶが、
 *   Next.js の fetch キャッシュで自動 dedupe されるので二重リクエストにはならない。
 * - 取得失敗時は最低限の title のみのフォールバックを返し、ページ自体は
 *   page() 側のエラーハンドリングに任せる。
 */
export async function generateMetadata(
  props: PageProps<"/repositories/[owner]/[repo]">,
): Promise<Metadata> {
  const { owner, repo } = await props.params;

  try {
    const detail = await getRepository(owner, repo);
    const description = detail.description ?? `GitHub repository ${detail.fullName}`;

    return {
      title: detail.fullName,
      description,
      openGraph: {
        title: `${detail.fullName} · repo-search`,
        description,
        images: [{ url: detail.owner.avatarUrl, width: 460, height: 460 }],
        type: "website",
      },
      twitter: {
        card: "summary",
        title: `${detail.fullName} · repo-search`,
        description,
        images: [detail.owner.avatarUrl],
      },
    };
  } catch {
    // 詳細取得失敗時は最低限のメタデータだけ返す。
    return { title: `${owner}/${repo}` };
  }
}

/**
 * リポジトリ詳細ページ (Server Component, SSR)。
 *
 * - dynamic segments `params` は `Promise` (Next.js v15+ の Async Request APIs)。
 * - `NotFoundError` は notFound() で 404 ページに飛ばす (App Router 規約)。
 * - レート制限はユーザに残時間を見せたいので一覧と同じく専用 UI に流す。
 *   それ以外の例外は error.tsx に伝播させる。
 */
export default async function Page(props: PageProps<"/repositories/[owner]/[repo]">) {
  const { owner, repo } = await props.params;

  let detail;
  try {
    detail = await getRepository(owner, repo);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    if (error instanceof RateLimitError) {
      // eslint-disable-next-line react-hooks/purity -- Server Component, request scoped
      const now = Date.now();
      const minutesUntilReset = error.resetAt
        ? Math.max(0, Math.ceil((error.resetAt.getTime() - now) / 60_000))
        : null;
      return <RateLimitNotice minutesUntilReset={minutesUntilReset} />;
    }
    throw error;
  }

  return <RepositoryDetailView detail={detail} />;
}
