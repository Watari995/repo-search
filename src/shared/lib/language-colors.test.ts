// @vitest-environment node

/**
 * 言語色 lookup の単体テスト。境界値中心。
 *
 * Linguist の値をそのまま採用しているため、対表値そのものを表明するというより
 * 「未知のときフォールバックする」「null/undefined を例外なく扱う」といった
 * 入力境界を確認する。
 */
import { describe, expect, it } from "vitest";
import { getLanguageColor } from "./language-colors";

describe("getLanguageColor", () => {
  it("メジャー言語は GitHub Linguist の色を返す", () => {
    expect(getLanguageColor("TypeScript")).toBe("#3178c6");
    expect(getLanguageColor("Python")).toBe("#3572A5");
    expect(getLanguageColor("Vue")).toBe("#41b883");
  });

  it("null / undefined はフォールバック色", () => {
    expect(getLanguageColor(null)).toBe("#8b949e");
    expect(getLanguageColor(undefined)).toBe("#8b949e");
  });

  it("未収録の言語名はフォールバック色", () => {
    expect(getLanguageColor("Brainfuck")).toBe("#8b949e");
  });

  it("大文字小文字違いはマッチしない (GitHub API の言語名は正準化済み前提)", () => {
    expect(getLanguageColor("typescript")).toBe("#8b949e");
    expect(getLanguageColor("TYPESCRIPT")).toBe("#8b949e");
  });
});
