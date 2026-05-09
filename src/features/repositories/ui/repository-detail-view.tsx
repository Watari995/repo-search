import {
  ArrowLeftIcon,
  EyeIcon,
  IssueOpenedIcon,
  LinkExternalIcon,
  RepoForkedIcon,
  StarIcon,
} from "@primer/octicons-react";
import Image from "next/image";
import Link from "next/link";
import { formatCompactNumber } from "@/shared/lib/format-number";
import type { RepositoryDetail } from "../domain/repository";

/**
 * リポジトリ詳細ページの本体 UI。
 *
 * 要件にある 4 つの数値 (Star / Watcher / Fork / Issue) をカード状に並べる。
 * GitHub の Insights タブの数値カードと近い雰囲気。
 *
 * Server Component のため React state は持たず、props だけで完結する。
 */
export function RepositoryDetailView({ detail }: { detail: RepositoryDetail }) {
  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/repositories"
        className="text-fg-muted hover:text-accent-fg inline-flex w-fit items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeftIcon size={14} aria-hidden />
        Back to results
      </Link>

      <header className="flex items-start gap-4">
        <Image
          src={detail.owner.avatarUrl}
          alt=""
          width={64}
          height={64}
          className="border-border-muted rounded-full border"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-fg-default text-2xl font-semibold leading-tight break-all">
            <span className="text-fg-muted font-normal">{detail.owner.login}/</span>
            <span>{detail.name}</span>
          </h1>
          {detail.language && (
            <p className="text-fg-muted mt-1 inline-flex items-center gap-1.5 text-sm">
              <span
                className="bg-accent-emphasis inline-block h-3 w-3 rounded-full"
                aria-hidden
              />
              {detail.language}
            </p>
          )}
        </div>
      </header>

      {detail.description && (
        <p className="text-fg-default text-base leading-relaxed">{detail.description}</p>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<StarIcon size={16} aria-hidden />}
          label="Stars"
          value={detail.starsCount}
        />
        <StatCard
          icon={<EyeIcon size={16} aria-hidden />}
          label="Watchers"
          value={detail.watchersCount}
        />
        <StatCard
          icon={<RepoForkedIcon size={16} aria-hidden />}
          label="Forks"
          value={detail.forksCount}
        />
        <StatCard
          icon={<IssueOpenedIcon size={16} aria-hidden />}
          label="Open Issues"
          value={detail.openIssuesCount}
        />
      </dl>

      <a
        href={detail.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="border-border-default text-fg-default hover:bg-neutral-muted focus-visible:outline-accent-fg inline-flex w-fit items-center gap-2 rounded-md border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2"
      >
        View on GitHub
        <LinkExternalIcon size={14} aria-hidden />
      </a>
    </article>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="border-border-muted bg-canvas-default rounded-md border p-4">
      <dt className="text-fg-muted flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {icon}
        {label}
      </dt>
      <dd className="text-fg-default mt-2 text-2xl font-semibold">
        {formatCompactNumber(value)}
        <span className="text-fg-subtle ml-1 text-xs font-normal">
          ({value.toLocaleString("en-US")})
        </span>
      </dd>
    </div>
  );
}
