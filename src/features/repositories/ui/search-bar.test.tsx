/**
 * SearchBar の URL 同期テスト。
 *
 * 「URL = State」を貫く設計上、ここがテストすべき最重要箇所。
 *   - submit で `/repositories?q=...` に push するか
 *   - 空文字 / 半角スペースだけで push しないか
 *   - クエリ変更時に page を URL から落とすか (検索すると 1 ページ目に戻る)
 *
 * next/navigation の `useRouter` / `useSearchParams` は vi.mock で差し替える。
 * SearchBar 自身が呼ぶ API (router.push) を spy するシンプルな構成。
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushSpy = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy, replace: vi.fn(), back: vi.fn(), forward: vi.fn() }),
  useSearchParams: () => currentSearchParams,
}));

import { SearchBar } from "./search-bar";

beforeEach(() => {
  pushSpy.mockClear();
  currentSearchParams = new URLSearchParams();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("SearchBar", () => {
  it("入力 → submit で /repositories?q=... に push する", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    await user.type(screen.getByRole("searchbox"), "react");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(pushSpy).toHaveBeenCalledWith("/repositories?q=react");
  });

  it("既存のクエリ (q=old, page=3) を上書きし page を URL から落とす", async () => {
    currentSearchParams = new URLSearchParams({ q: "old", page: "3" });
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByRole("searchbox");
    await user.clear(input);
    await user.type(input, "next.js");
    await user.click(screen.getByRole("button", { name: /search/i }));

    // page=3 は消え、q だけが乗る
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy.mock.calls[0]?.[0]).toBe("/repositories?q=next.js");
  });

  it("空文字や半角スペースのみのクエリでは push しない", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(pushSpy).not.toHaveBeenCalled();

    await user.type(screen.getByRole("searchbox"), "   ");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("初期表示で URL の q を input の defaultValue として反映する", () => {
    currentSearchParams = new URLSearchParams({ q: "vue" });
    render(<SearchBar />);

    expect(screen.getByRole("searchbox")).toHaveValue("vue");
  });
});
