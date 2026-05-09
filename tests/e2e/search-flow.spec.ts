import { expect, test } from "@playwright/test";

/**
 * 主要フローの E2E スモーク。
 *
 * テストピラミッドの頂点として、ここでは「実ブラウザ + 実 GitHub API」を
 * 使った 1 本だけ流す。網羅は単体・結合に任せる。
 *
 * - 検索 "react" → 結果 → 先頭リポジトリ → 詳細 → 戻る → 入力保持
 * - GitHub API は実エンドポイントを叩く (60 req/h なら問題なし、
 *   CI では GITHUB_TOKEN を env に積めば 5000 req/h)
 * - Watcher 数の意味 (subscribers_count を採用) は単体テストで保証済みなので
 *   ここでは「Watchers ラベルが表示される」だけを確認する
 */
test("検索 → 一覧 → 詳細 → 戻る の主要フローが動く", async ({ page }) => {
  await page.goto("/repositories");

  // 初期状態は空状態 UI
  await expect(page.getByRole("heading", { name: /Search GitHub repositories/i })).toBeVisible();

  // 検索バーに入力して送信
  await page.getByRole("searchbox").fill("react");
  await page.getByRole("button", { name: /Search/i }).click();

  // URL に q=react が乗ること
  await expect(page).toHaveURL(/\?q=react/);

  // facebook/react が結果に含まれることを確認 (API 結果の中で stars 1位の常連)
  const firstResult = page.getByRole("link", { name: /facebook\/?\s*react/i }).first();
  await expect(firstResult).toBeVisible({ timeout: 15_000 });

  // 詳細ページに遷移
  await firstResult.click();
  await expect(page).toHaveURL(/\/repositories\/facebook\/react/);

  // 詳細ページの 4 つの数値カード見出しが見えること
  await expect(page.getByRole("heading", { name: /facebook\/?\s*react/i })).toBeVisible();
  await expect(page.getByText(/Stars/i, { exact: false })).toBeVisible();
  await expect(page.getByText(/Watchers/i, { exact: false })).toBeVisible();
  await expect(page.getByText(/Forks/i, { exact: false })).toBeVisible();
  await expect(page.getByText(/Open Issues/i, { exact: false })).toBeVisible();

  // 「Back to results」で戻ると q=react が保持されている
  await page.getByRole("link", { name: /Back to results/i }).click();
  await expect(page).toHaveURL(/\?q=react/);

  // 戻った後も検索バーに react が表示されている
  await expect(page.getByRole("searchbox")).toHaveValue("react");
});
