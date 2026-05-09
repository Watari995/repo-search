import "server-only";
import { z } from "zod";

/**
 * 環境変数のスキーマと検証。
 *
 * - サーバ側でのみ読む値はここで一括検証する。型は z.infer で得られる。
 * - すべての値を起動時に検証することで、後から「未設定でクラッシュ」する
 *   ランタイムエラーを起動時の明示的なエラーに格上げする (fail-fast)。
 * - `'server-only'` を import しているため、誤ってクライアントから import すると
 *   ビルド時に弾かれる。秘密値漏洩の保険。
 */
const envSchema = z.object({
  /** GitHub API のレート制限緩和用 PAT。未設定でも動くがレート制限に当たりやすい。 */
  GITHUB_TOKEN: z.string().min(1).optional(),

  /** Basic Auth の credential。両方揃った場合のみ認証ゲートが有効化される。 */
  BASIC_AUTH_USER: z.string().min(1).optional(),
  BASIC_AUTH_PASSWORD: z.string().min(8).optional(),

  /** メタデータの絶対 URL 解決用。Vercel デプロイ時に設定する。 */
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // process.exit ではなく throw にすることで、Next.js のビルドログにも出る。
  console.error("[env] 環境変数の検証に失敗しました:", z.treeifyError(parsed.error));
  throw new Error("環境変数が不正です。.env.local を確認してください。");
}

export const env = parsed.data;

/**
 * Basic Auth ゲートが有効か。`proxy.ts` の早期 return 判定で使う。
 * env が片方しか設定されていない (中途半端) ときは「無効」扱い。
 */
export const isAuthEnabled = Boolean(env.BASIC_AUTH_USER && env.BASIC_AUTH_PASSWORD);
