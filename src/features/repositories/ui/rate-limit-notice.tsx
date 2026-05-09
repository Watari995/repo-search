import { ClockIcon } from "@primer/octicons-react";

/**
 * GitHub API のレート制限に当たった際の専用 UI。
 *
 * `resetAt` が分かっていれば「あと X 分」を表示することで、ユーザに
 * 「いつ再試行できるか」の情報を渡す。これは error.tsx の汎用バウンダリ
 * では実現できない (server → client への転送で値が失われるため)。
 *
 * 残時間の計算は呼び出し側 (page.tsx) で行い、本コンポーネントは
 * 純粋に `minutesUntilReset` を表示するだけにする (impure な現在時刻を
 * 描画関数から追い出す)。
 */
export function RateLimitNotice({ minutesUntilReset }: { minutesUntilReset: number | null }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-md border border-attention-fg/40 bg-canvas-subtle p-8 text-center"
    >
      <ClockIcon size={32} className="text-attention-fg" aria-hidden />
      <h2 className="text-lg font-semibold text-fg-default">Rate limit reached</h2>
      <p className="max-w-md text-sm text-fg-muted">
        GitHub API のレート制限に達しました。
        {minutesUntilReset !== null && minutesUntilReset > 0
          ? ` 約 ${minutesUntilReset} 分後に再試行できます。`
          : " しばらく待ってから再試行してください。"}
      </p>
      <p className="text-xs text-fg-subtle">
        環境変数 <code className="font-mono">GITHUB_TOKEN</code> を設定すると 5000 req/h
        まで緩和できます。
      </p>
    </div>
  );
}
