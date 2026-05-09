import type { Repository } from "../domain/repository";
import { RepositoryCard } from "./repository-card";

/**
 * 検索結果のカードを縦並びにする。
 *
 * 一覧自体に状態はないため Server Component。
 * 配列順 (= API が返した順 = stars desc) をそのまま採用する。
 */
export function RepositoryList({ items }: { items: Repository[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((repo) => (
        <li key={repo.id}>
          <RepositoryCard repo={repo} />
        </li>
      ))}
    </ul>
  );
}
