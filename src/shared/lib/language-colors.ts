/**
 * 言語ごとの色マップ (GitHub Linguist 由来)。
 *
 * GitHub の検索結果と同じ見た目にするため、Linguist が公開している色値を
 * そのまま採用する。本番のリポジトリで遭遇しやすい上位言語に絞り、
 * 未収録のものは中立色 (#8b949e) にフォールバックする。
 *
 * 出典: https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml
 *   (`color:` フィールドをそのまま転記)
 *
 * 全 600+ 言語をパッケージ (`linguist-languages` 等) で取り込むこともできるが、
 * クライアント Server Component に乗せるには重い。Top ~50 を手で持つ方針。
 */
const LANGUAGE_COLORS: Record<string, string> = {
  // 上位の汎用言語
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  "Objective-C": "#438eff",
  Perl: "#0298c3",
  Lua: "#000080",
  Haskell: "#5e5086",
  Clojure: "#db5855",
  Elixir: "#6e4a7e",
  Erlang: "#B83998",
  Julia: "#a270ba",
  R: "#198CE7",
  Solidity: "#AA6746",
  Zig: "#ec915c",
  Nim: "#ffc200",

  // フロントエンド
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Astro: "#ff5a03",
  HTML: "#e34c26",
  CSS: "#663399",
  SCSS: "#c6538c",
  Sass: "#a53b70",
  Less: "#1d365d",
  Stylus: "#ff6347",
  CoffeeScript: "#244776",

  // シェル / インフラ
  Shell: "#89e051",
  PowerShell: "#012456",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  HCL: "#844FBA",

  // データ / ノートブック
  "Jupyter Notebook": "#DA5B0B",
  TeX: "#3D6117",
  Markdown: "#083fa1",

  // 関数型 / 学術系
  OCaml: "#3be133",
  "F#": "#b845fc",
  Crystal: "#000100",
  D: "#ba595e",
};

/** 未収録言語と language=null のときに使う中立色 (GitHub の "neutral muted" 相当)。 */
const FALLBACK_LANGUAGE_COLOR = "#8b949e";

/**
 * 言語名から色コードを返す純関数。
 * 大文字小文字違いの言語名 (例: "javascript") は受け付けず、フォールバックする
 * (GitHub API のレスポンスは正準化済みの言語名を返してくるため)。
 */
export function getLanguageColor(language: string | null | undefined): string {
  if (!language) return FALLBACK_LANGUAGE_COLOR;
  return LANGUAGE_COLORS[language] ?? FALLBACK_LANGUAGE_COLOR;
}
