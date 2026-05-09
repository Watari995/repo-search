import { NextResponse, type NextRequest } from "next/server";
import { verifyBasicAuth } from "@/shared/auth/basic-auth";
import { env, isAuthEnabled } from "@/shared/lib/env";

/**
 * Next.js v16 の `proxy.ts` (旧 middleware.ts)。
 *
 * v15 の `middleware` ファイル名は v16 で deprecated となり、`proxy` に renamed
 * (リネームの理由は「ネットワーク境界 / ルーティング」を強調したいため)。
 * Edge Runtime は使えず Node.js Runtime 固定。Basic Auth のような認可ゲートには
 * 十分。
 *
 * 設計の要点:
 *   - 判定ロジックは `verifyBasicAuth` (純関数) に切り出してテスト可能化
 *   - env が両方揃っていない (= isAuthEnabled が false) ときは素通し。
 *     ローカル開発で env 未設定でも普通に触れるようにするため
 *   - matcher で _next 系・favicon・/api/health を除外。
 *     - _next 系: 静的アセットや画像最適化を毎回認証させない (FOUC 防止)
 *     - /api/health: Vercel の死活監視で 401 を出さないようにする
 */
export function proxy(request: NextRequest) {
  if (!isAuthEnabled) {
    return NextResponse.next();
  }

  const credentials = {
    // env スキーマで両方の存在は isAuthEnabled の時点で保証されている。
    user: env.BASIC_AUTH_USER as string,
    password: env.BASIC_AUTH_PASSWORD as string,
  };

  if (verifyBasicAuth(request.headers.get("authorization"), credentials)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      // realm はブラウザ側のログインダイアログのタイトルになる
      "WWW-Authenticate": 'Basic realm="repo-search", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
