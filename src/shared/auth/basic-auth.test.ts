// @vitest-environment node

/**
 * Basic Auth 判定の単体テスト。
 *
 * proxy.ts (NextRequest/NextResponse) はモックが煩雑なので判定ロジックを
 * 純関数に切り出している。ここで境界値を中心に守り、proxy 本体は配線のみにする。
 *
 * ★ Authorization 周りは「壊れたら認証が破綻する」セキュリティ上重要な箇所。
 * 浅く広くではなく、入力の意地悪なバリエーションを多めに表明する。
 */
import { describe, expect, it } from "vitest";
import { verifyBasicAuth } from "./basic-auth";

const expected = { user: "demo", password: "p4ssw0rd!" };

function basicHeader(user: string, password: string): string {
  return `Basic ${btoa(`${user}:${password}`)}`;
}

describe("verifyBasicAuth", () => {
  it("正しい credential なら true", () => {
    expect(verifyBasicAuth(basicHeader("demo", "p4ssw0rd!"), expected)).toBe(true);
  });

  it("ユーザ名違いは false", () => {
    expect(verifyBasicAuth(basicHeader("admin", "p4ssw0rd!"), expected)).toBe(false);
  });

  it("パスワード違いは false", () => {
    expect(verifyBasicAuth(basicHeader("demo", "wrong"), expected)).toBe(false);
  });

  it("ヘッダ未指定 (null/undefined/空文字) は false", () => {
    expect(verifyBasicAuth(null, expected)).toBe(false);
    expect(verifyBasicAuth(undefined, expected)).toBe(false);
    expect(verifyBasicAuth("", expected)).toBe(false);
  });

  it("スキーマが Basic 以外は false (Bearer 等)", () => {
    expect(verifyBasicAuth(`Bearer ${btoa("demo:p4ssw0rd!")}`, expected)).toBe(false);
  });

  it("base64 部が空 (Basic スペース末尾だけ) は false", () => {
    expect(verifyBasicAuth("Basic ", expected)).toBe(false);
    expect(verifyBasicAuth("Basic     ", expected)).toBe(false);
  });

  it("base64 デコードできない値は false (例外を漏らさない)", () => {
    expect(verifyBasicAuth("Basic !!!not-base64!!!", expected)).toBe(false);
  });

  it("コロンを含まないペイロードは false", () => {
    expect(verifyBasicAuth(`Basic ${btoa("nocolonhere")}`, expected)).toBe(false);
  });

  it("パスワードに `:` を含むケースでも先頭の `:` だけで分割する", () => {
    // 例: "demo:abc:def" は user=demo, password="abc:def" として分割される
    const expected2 = { user: "demo", password: "abc:def" };
    expect(verifyBasicAuth(basicHeader("demo", "abc:def"), expected2)).toBe(true);
  });

  it("空ユーザ/空パスワードは false (env 検証側でも弾く想定だが念のため)", () => {
    expect(verifyBasicAuth(basicHeader("", "p4ssw0rd!"), expected)).toBe(false);
    expect(verifyBasicAuth(basicHeader("demo", ""), expected)).toBe(false);
  });
});
