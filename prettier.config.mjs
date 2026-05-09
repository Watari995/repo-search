/**
 * Prettier 3 設定。
 *
 * - prettier-plugin-tailwindcss: className のクラス順を Tailwind 推奨順に
 *   揃えてレビュー時の差分を減らす。Tailwind v4 のプロジェクトでは
 *   tailwindStylesheet をエントリの CSS に向けるとカスタムテーマも認識される。
 * - 単純な好み (semi, double quotes) は Next.js デフォルトに揃えている。
 */
/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
};

export default config;
