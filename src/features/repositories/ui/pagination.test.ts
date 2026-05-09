// @vitest-environment node

/**
 * `buildPageItems` の純関数テスト。
 *
 * ページネーション UI 自体は <Link href> の薄いラッパなので、
 * 値計算ロジック (どのページ番号と省略を出すか) を分離して
 * ここで集中して守る。境界値ベース。
 */
import { describe, expect, it } from "vitest";
import { buildPageItems } from "./pagination";

describe("buildPageItems", () => {
  it("総ページ 1 のときは [1] を返す (UI 側で disable)", () => {
    expect(buildPageItems(1, 1)).toEqual([1]);
  });

  it("総ページが少ない場合は ellipsis を入れない", () => {
    expect(buildPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("先頭近くのページではトレーリング ellipsis のみ出す", () => {
    expect(buildPageItems(1, 50)).toEqual([1, 2, 3, "ellipsis", 50]);
    expect(buildPageItems(2, 50)).toEqual([1, 2, 3, 4, "ellipsis", 50]);
  });

  it("中央のページでは両側に ellipsis を出す", () => {
    expect(buildPageItems(10, 50)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 50]);
  });

  it("末尾近くのページでは先頭側だけ ellipsis を出す", () => {
    expect(buildPageItems(49, 50)).toEqual([1, "ellipsis", 47, 48, 49, 50]);
    expect(buildPageItems(50, 50)).toEqual([1, "ellipsis", 48, 49, 50]);
  });

  it("隣接ページ (差 1) のときは ellipsis を入れない", () => {
    // 1, 2, 3, 4, 5, 6 がすべて出る場合に「1, ..., 3, 4, 5, ...」みたいにならないこと
    expect(buildPageItems(4, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
