/**
 * 骨組み (skeleton) のプレースホルダ。
 *
 * `animate-pulse` で読み込み中であることを視覚的に示す。
 * `aria-hidden` によりスクリーンリーダーから読み上げないようにし、
 * 親側で `aria-busy` / `aria-live` を出すのが望ましい。
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-neutral-muted animate-pulse rounded ${className ?? ""}`} aria-hidden />
  );
}
