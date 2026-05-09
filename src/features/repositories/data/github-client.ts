import "server-only";

import { env } from "@/shared/lib/env";
import {
  GitHubApiError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

const GITHUB_API_ROOT = "https://api.github.com";

/**
 * Next.js v16 の fetch オプション拡張。
 * Server Component 上から呼ぶ前提で、ISR 的な振る舞いを得るため
 * `next: { revalidate }` を渡せるようにしている。
 */
export type GitHubFetchInit = RequestInit & {
  next?: { revalidate?: number; tags?: string[] };
};

/**
 * GitHub REST API への共通アクセス関数。
 *
 * 設計の要点:
 *   - 認証ヘッダ: GITHUB_TOKEN があれば付与。未設定でも動くが 60 req/h と厳しい。
 *   - 必須ヘッダ:
 *       Accept: application/vnd.github+json   (公式推奨 MIME)
 *       X-GitHub-Api-Version: 2022-11-28      (API バージョン pin、後方互換性確保)
 *       User-Agent                            (GitHub の規約上必須)
 *   - キャッシュ戦略は呼び出し側で revalidate を指定する。
 *   - エラーは status code でドメイン例外にマッピングし、
 *     とくに 403 + `X-RateLimit-Remaining: 0` と純粋な権限エラーを峻別する。
 *   - `'server-only'` を import しているため、誤ってクライアントから利用すると
 *     Next.js のビルド時に弾かれる (秘密値漏洩防止)。
 *
 * @param path 例: "/search/repositories?q=react&per_page=20"
 */
export async function githubFetch<T>(path: string, init?: GitHubFetchInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("User-Agent", "repo-search/0.1.0 (Next.js demo)");
  if (env.GITHUB_TOKEN) {
    headers.set("Authorization", `Bearer ${env.GITHUB_TOKEN}`);
  }

  let response: Response;
  try {
    response = await fetch(`${GITHUB_API_ROOT}${path}`, {
      ...init,
      headers,
    });
  } catch (cause) {
    // fetch そのものが reject するのは TypeError (DNS, abort, CORS 等) が大半。
    // 上流 cause を握って NetworkError に詰め替える。
    throw new NetworkError(cause);
  }

  if (!response.ok) {
    throw await mapErrorResponse(response);
  }

  return (await response.json()) as T;
}

/**
 * HTTP レスポンスをドメイン例外に変換する。
 *
 * 403 はレート制限と権限不足の両方で返るため、ヘッダで判別する。
 * ここを「全部 GitHubApiError にする」と UI の分岐ができないので
 * 必ず具体型に落とす。
 */
async function mapErrorResponse(response: Response): Promise<GitHubApiError> {
  const status = response.status;

  if (status === 401) return new UnauthorizedError();
  if (status === 404) return new NotFoundError();
  if (status === 422) return new ValidationError();

  if (status === 429 || (status === 403 && isRateLimited(response))) {
    return new RateLimitError(extractRateLimitReset(response));
  }

  const body = await safeText(response);
  return new GitHubApiError(`GitHub API がエラーを返しました (${status})`, status, body);
}

function isRateLimited(response: Response): boolean {
  return response.headers.get("X-RateLimit-Remaining") === "0";
}

function extractRateLimitReset(response: Response): Date | null {
  const reset = response.headers.get("X-RateLimit-Reset");
  if (!reset) return null;
  const epochSec = Number(reset);
  if (!Number.isFinite(epochSec)) return null;
  return new Date(epochSec * 1000);
}

async function safeText(response: Response): Promise<string | undefined> {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}
