import { notFound } from "next/navigation";
import { NotFoundError, RateLimitError } from "@/features/repositories/data/errors";
import { getRepository } from "@/features/repositories/data/get-repository";
import { RateLimitNotice } from "@/features/repositories/ui/rate-limit-notice";
import { RepositoryDetailView } from "@/features/repositories/ui/repository-detail-view";

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
