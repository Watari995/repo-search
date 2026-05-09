import { NextResponse } from "next/server";

/**
 * 死活監視用エンドポイント。
 *
 * Basic Auth ゲート (proxy.ts) のmatcher から除外しているので、
 * 認証なしでアクセスできる。Vercel のヘルスチェックや uptime 監視から叩く想定。
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", at: new Date().toISOString() });
}
