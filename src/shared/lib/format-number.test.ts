// @vitest-environment node

/**
 * `formatCompactNumber` の境界値テスト。
 *
 * 桁の境界 (999/1000, 9999/10000, 999_999/1_000_000) は実装で
 * if 分岐が切り替わる箇所であり、ここでバグが入りやすいので集中して検証する。
 * 「広く深く」ではなく「ピンポイントで境界を抑える」方針。
 */
import { describe, expect, it } from "vitest";
import { formatCompactNumber } from "./format-number";

describe("formatCompactNumber", () => {
  it("999 までは整数のまま", () => {
    expect(formatCompactNumber(0)).toBe("0");
    expect(formatCompactNumber(1)).toBe("1");
    expect(formatCompactNumber(999)).toBe("999");
  });

  it("1000 以上 9_999 以下は 1.2k 表記 (切り捨て)", () => {
    expect(formatCompactNumber(1_000)).toBe("1k");
    expect(formatCompactNumber(1_500)).toBe("1.5k");
    expect(formatCompactNumber(1_549)).toBe("1.5k");
    expect(formatCompactNumber(9_999)).toBe("9.9k");
  });

  it("10_000 以上 999_999 以下は 12k 表記 (小数なし)", () => {
    expect(formatCompactNumber(10_000)).toBe("10k");
    expect(formatCompactNumber(12_345)).toBe("12k");
    expect(formatCompactNumber(999_999)).toBe("999k");
  });

  it("1M 以上 9.9M 以下は 1.2M 表記", () => {
    expect(formatCompactNumber(1_000_000)).toBe("1M");
    expect(formatCompactNumber(2_500_000)).toBe("2.5M");
    expect(formatCompactNumber(9_999_999)).toBe("9.9M");
  });

  it("10M 以上は小数なしの M 表記", () => {
    expect(formatCompactNumber(10_000_000)).toBe("10M");
    expect(formatCompactNumber(123_456_789)).toBe("123M");
  });

  it("不正値は 0 にフォールバック", () => {
    expect(formatCompactNumber(Number.NaN)).toBe("0");
    expect(formatCompactNumber(-1)).toBe("0");
    expect(formatCompactNumber(Number.POSITIVE_INFINITY)).toBe("0");
  });
});
