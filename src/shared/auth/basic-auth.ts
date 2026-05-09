/**
 * Basic Auth の `Authorization` ヘッダを検証する純関数。
 *
 * proxy.ts (Next.js v16 の認可ゲート) から呼ばれる。
 * proxy 本体は NextRequest/NextResponse を扱うため単体テストが煩雑なので、
 * ここに判定ロジックを切り出して純関数として保つ。
 *
 * - "Basic <base64>" の形式を期待する
 * - base64 デコードして "user:pass" に分割
 * - credential は厳密一致 (timing-safe 比較は Basic Auth の脅威モデルに対し
 *   過剰なため、シンプルな等価比較に留める)
 */
export type BasicAuthCredentials = {
  user: string;
  password: string;
};

export function verifyBasicAuth(
  authHeader: string | null | undefined,
  expected: BasicAuthCredentials,
): boolean {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const encoded = authHeader.slice("Basic ".length).trim();
  if (encoded === "") return false;

  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return false;

  const user = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  return user === expected.user && password === expected.password;
}
