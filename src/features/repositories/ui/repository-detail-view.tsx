import {
  EyeIcon,
  IssueOpenedIcon,
  LinkExternalIcon,
  RepoForkedIcon,
  StarIcon,
} from "@primer/octicons-react";
import Image from "next/image";
import { formatCompactNumber } from "@/shared/lib/format-number";
import { getLanguageColor } from "@/shared/lib/language-colors";
import type { RepositoryDetail } from "../domain/repository";
import { BackToResults } from "./back-to-results";

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
      <BackToResults />

      <header className="flex items-start gap-4">
        <Image
          src={detail.owner.avatarUrl}
          alt=""
          width={64}
          height={64}
          className="rounded-full border border-border-muted"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-tight font-semibold break-all text-fg-default">
            <span className="font-normal text-fg-muted">{detail.owner.login}/</span>
            <span>{detail.name}</span>
          </h1>
          {detail.language && (
            <p className="text-fg-muted mt-1 inline-flex items-center gap-1.5 text-sm">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: getLanguageColor(detail.language) }}
                aria-hidden
              />
              {detail.language}
            </p>
          )}
        </div>
      </header>

      {detail.description && (
        <p className="text-base leading-relaxed text-fg-default">{detail.description}</p>
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
        className="inline-flex w-fit items-center gap-2 rounded-md border border-border-default px-4 py-1.5 text-sm font-medium text-fg-default transition-colors hover:bg-neutral-muted focus-visible:outline-2 focus-visible:outline-accent-fg"
      >
        View on GitHub
        <LinkExternalIcon size={14} aria-hidden />
      </a>
    </article>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-md border border-border-muted bg-canvas-default p-4">
      <dt className="flex items-center gap-1.5 text-xs tracking-wider text-fg-muted uppercase">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 text-2xl font-semibold text-fg-default">
        {formatCompactNumber(value)}
        <span className="ml-1 text-xs font-normal text-fg-subtle">
          ({value.toLocaleString("en-US")})
        </span>
      </dd>
    </div>
  );
}
