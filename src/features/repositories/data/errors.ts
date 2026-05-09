/**
 * GitHub API クライアントが投げるエラー型階層。
 *
 * 単純な `Error` ではなく具体型に分けている理由:
 *   - UI 側 (`error.tsx`) が `instanceof RateLimitError` のような分岐で
 *     ユーザ向け文言を出し分けられる。
 *   - レート制限と権限エラーはどちらも 403 だが、ユーザが取るべき行動が違う
 *     (待つ vs 認証情報を見直す) ため、別の型として早めに分離する。
 *   - テストで「この入力ならこの例外が投げられる」と表明しやすい。
 */

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

/**
 * レート制限超過。
 * 403 + `X-RateLimit-Remaining: 0` または 429 で投げられる。
 * `resetAt` は UI に「X 分後に再試行できます」を表示するため。
 */
export class RateLimitError extends GitHubApiError {
  constructor(
    public readonly resetAt: Date | null,
    message = "GitHub API のレート制限に達しました",
  ) {
    super(message, 403);
    this.name = "RateLimitError";
  }
}

export class UnauthorizedError extends GitHubApiError {
  constructor(message = "GitHub API への認証が必要です") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends GitHubApiError {
  constructor(message = "対象のリソースが見つかりません") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * 検索クエリが空などの 422 系。
 * GitHub Search API は `q` が空の場合 422 を返してくる。
 */
export class ValidationError extends GitHubApiError {
  constructor(message = "GitHub API へのリクエストが不正です") {
    super(message, 422);
    this.name = "ValidationError";
  }
}

/**
 * fetch 自体が reject したケース (DNS / ネットワーク切断等)。
 * 上流のエラーは `cause` で保持する。
 */
export class NetworkError extends GitHubApiError {
  constructor(cause: unknown, message = "GitHub API との通信に失敗しました") {
    super(message, 0, cause);
    this.name = "NetworkError";
  }
}
