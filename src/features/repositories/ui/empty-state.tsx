import { SearchIcon } from "@primer/octicons-react";

/**
 * 検索画面の空状態 2 種を 1 コンポーネントで担う。
 *   - "initial"  : クエリ未入力の最初の表示
 *   - "not-found": 検索したが 0 件
 *
 * モードを props で切り替えるのは、配置場所と装飾を共通化したいため。
 * UI のテキストは GitHub の「No results matched your search」に近いトーン。
 */
type Props =
  | { mode: "initial" }
  | { mode: "not-found"; query: string };

export function EmptyState(props: Props) {
  const heading = props.mode === "initial" ? "Search GitHub repositories" : "No repositories found";
  const description =
    props.mode === "initial"
      ? "Enter a keyword above to find repositories on GitHub."
      : `Your search "${props.query}" did not match any repositories.`;

  return (
    <div className="border-border-muted bg-canvas-subtle/40 flex flex-col items-center gap-2 rounded-md border border-dashed py-16 text-center">
      <SearchIcon size={32} className="text-fg-subtle" aria-hidden />
      <h2 className="text-fg-default text-base font-semibold">{heading}</h2>
      <p className="text-fg-muted max-w-sm text-sm">{description}</p>
    </div>
  );
}
