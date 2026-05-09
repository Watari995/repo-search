import { IssueOpenedIcon, RepoForkedIcon, StarIcon } from "@primer/octicons-react";
import Image from "next/image";
import Link from "next/link";
import { formatCompactNumber } from "@/shared/lib/format-number";
import { getLanguageColor } from "@/shared/lib/language-colors";
import type { Repository } from "../domain/repository";

/**
 * 検索結果一覧の 1 行を担うカード。
 *
 * Server Component として描画しているため、ハイドレーション後も JS バンドルに
 * 含まれない。Avatar は `<Image>` で WebP 変換 + lazy load。
 *
 * 設計の要点:
 *   - `<Link>` の擬似要素 `::after` を `absolute inset-0` で広げる "stretched link"
 *     パターンで、カード全体を 1 つの遷移先 (詳細ページ) のクリック領域にしている。
 *     セマンティクスは <h2> 内の Link 1 つのまま (アクセシビリティ的に綺麗)。
 *     GitHub の検索結果カードも同様の挙動。
 *   - 言語ドットは GitHub Linguist の正式色を `style` で当てる (Tailwind の
 *     ユーティリティでは静的解析できない動的値のため inline style にする)。
 *   - `<Link prefetch>` のデフォルトで viewport 内 Link は自動 prefetch され、
 *     クリック時の体感はほぼ即時。
 */
export function RepositoryCard({ repo }: { repo: Repository }) {
  return (
    <article className="group relative rounded-md border border-border-muted bg-canvas-default p-4 transition-colors hover:border-accent-emphasis has-focus-visible:border-accent-emphasis has-focus-visible:ring-2 has-focus-visible:ring-accent-fg/40">
      <div className="flex items-start gap-3">
        <Image
          src={repo.owner.avatarUrl}
          alt=""
          width={40}
          height={40}
          className="rounded-full border border-border-muted"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base leading-tight font-semibold">
            <Link
              href={`/repositories/${repo.owner.login}/${repo.name}`}
              // after:* で <a> の擬似要素をカード全体に広げ、クリック範囲を拡張する。
              // outline-none + has-focus-visible:ring (article 側) で focus visual を
              // カード全体に出すことで、Tab キーの目印を見やすくしている。
              className="text-accent-fg group-hover:underline after:absolute after:inset-0 after:content-[''] focus:outline-none"
            >
              <span className="font-normal text-fg-muted">{repo.owner.login}/</span>
              <span>{repo.name}</span>
            </Link>
          </h2>
          {repo.description && (
            <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{repo.description}</p>
          )}
          <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
            {repo.language && (
              <div className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                  aria-hidden
                />
                <dt className="sr-only">Language</dt>
                <dd>{repo.language}</dd>
              </div>
            )}
            <Stat icon={<StarIcon size={12} aria-hidden />} label="Stars">
              {formatCompactNumber(repo.starsCount)}
            </Stat>
            <Stat icon={<RepoForkedIcon size={12} aria-hidden />} label="Forks">
              {formatCompactNumber(repo.forksCount)}
            </Stat>
            <Stat icon={<IssueOpenedIcon size={12} aria-hidden />} label="Open issues">
              {formatCompactNumber(repo.openIssuesCount)}
            </Stat>
            <span aria-hidden>·</span>
            <span>Updated {formatDate(repo.updatedAt)}</span>
          </dl>
        </div>
      </div>
    </article>
  );
}

function Stat({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {icon}
      <dt className="sr-only">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * "Apr 1, 2026" 形式に整形する。
 * Server Component で動くため、ロケール (en-US) を固定して
 * SSR/CSR の差分を出さない。
 */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
