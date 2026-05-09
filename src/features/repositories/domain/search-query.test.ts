// @vitest-environment node

/**
 * `parseSearchQuery` / `calculateTotalPages` の単体テスト。
 *
 * URL = State の中核ロジック。バグると「URL に q=react が乗るが
 * 検索が走らない」「page=99999 を踏むと API が壊れる」など、
 * ユーザ操作ですぐ顕在化する問題を生むため重点的に守る。
 */
import { describe, expect, it } from "vitest";
import {
  MAX_PAGE,
  PER_PAGE,
  calculateTotalPages,
  parseSearchQuery,
} from "./search-query";

describe("parseSearchQuery", () => {
  it("空のクエリは isEmpty: true で短絡する", () => {
    expect(parseSearchQuery({})).toEqual({ isEmpty: true });
    expect(parseSearchQuery({ q: "" })).toEqual({ isEmpty: true });
  });

  it("半角スペースのみは空扱い (GitHub に投げると 422 になるため事前に弾く)", () => {
    expect(parseSearchQuery({ q: "   " })).toEqual({ isEmpty: true });
  });

  it("通常のクエリは page=1 を既定とする", () => {
    expect(parseSearchQuery({ q: "react" })).toEqual({
      isEmpty: false,
      q: "react",
      page: 1,
    });
  });

  it("page を数値としてパースする", () => {
    expect(parseSearchQuery({ q: "react", page: "3" })).toMatchObject({
      page: 3,
    });
  });

  it("不正な page は 1 にクリップする", () => {
    expect(parseSearchQuery({ q: "react", page: "abc" })).toMatchObject({ page: 1 });
    expect(parseSearchQuery({ q: "react", page: "-5" })).toMatchObject({ page: 1 });
    expect(parseSearchQuery({ q: "react", page: "0" })).toMatchObject({ page: 1 });
  });

  it("Search API の上限を超える page は MAX_PAGE にクリップする", () => {
    expect(parseSearchQuery({ q: "react", page: "9999" })).toMatchObject({
      page: MAX_PAGE,
    });
  });

  it("配列で入ってきた値は先頭を採用する (?q=a&q=b 対策)", () => {
    expect(parseSearchQuery({ q: ["foo", "bar"] })).toMatchObject({ q: "foo" });
    expect(parseSearchQuery({ q: "foo", page: ["7", "9"] })).toMatchObject({ page: 7 });
  });
});

describe("calculateTotalPages", () => {
  it("totalCount=0 はページなし", () => {
    expect(calculateTotalPages(0)).toBe(0);
  });

  it("PER_PAGE 以下は 1 ページ", () => {
    expect(calculateTotalPages(1)).toBe(1);
    expect(calculateTotalPages(PER_PAGE)).toBe(1);
  });

  it("PER_PAGE+1 から 2 ページ目に切り替わる", () => {
    expect(calculateTotalPages(PER_PAGE + 1)).toBe(2);
  });

  it("Search API の上限 (1000件) を超えても MAX_PAGE で止める", () => {
    expect(calculateTotalPages(50_000_000)).toBe(MAX_PAGE);
    expect(calculateTotalPages(1_000_000)).toBe(MAX_PAGE);
  });
});
