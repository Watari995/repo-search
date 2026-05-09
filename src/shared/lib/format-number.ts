/**
 * 数値を GitHub UI 風にコンパクトに表示するためのフォーマッタ。
 *
 * - 0 〜 999 はそのまま整数表示
 * - 1k 〜 9.9k は小数 1 桁の k 表記 (1.2k)
 * - 10k 〜 999k は小数なしの k 表記 (12k)
 * - 1M 以上は小数 1 桁の M 表記 (1.2M)
 *
 * 切り捨てを採用するのは、GitHub の表示が四捨五入ではなく切り捨てに近いため
 * (ユーザの「もう少しで届きそう」感を優先)。境界値の挙動はテストで保証する。
 */
export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";

  if (n < 1_000) return String(Math.floor(n));

  if (n < 10_000) {
    const value = Math.floor(n / 100) / 10;
    return `${value}k`;
  }

  if (n < 1_000_000) {
    return `${Math.floor(n / 1_000)}k`;
  }

  if (n < 10_000_000) {
    const value = Math.floor(n / 100_000) / 10;
    return `${value}M`;
  }

  return `${Math.floor(n / 1_000_000)}M`;
}
