# テスト戦略

このドキュメントは、本リポジトリ (GitHub Repository Search / Next.js 16) の **テスト方針** と **その判断根拠** をまとめたものです。
要件として「広く深くテストすればよいのではなく、重点を絞り戦略にこだわる」とあったため、
*何を* テストし *何を* テストしないか、そして *なぜ* その判断をしたかを言語化することを最優先しています。

---

## 1. 哲学

> テストは仕様の防衛線である。守るべき価値のある仕様にだけコストを払う。

採用した 3 つの設計原則:

1. **壊れて気づきにくい箇所を優先する**
   レイアウトの崩れは目視で気づく。一方「数値が間違っている」「URL の状態が壊れている」は黙って通り抜ける。
   後者を優先して防衛する。
2. **ドメイン知識を反映するテストを書く**
   GitHub API の `watchers_count` と `subscribers_count` の取り違えのような、
   *知っていなければ書けない* テストこそ評価に値する。
3. **フレームワークではなく自分のコードをテストする**
   Next.js / React / GitHub API そのものの挙動は外部チームが守っている。
   私が書いたコードのうち「私の判断が入った箇所」だけをテスト対象にする。

---

## 2. テストピラミッド

| 層 | ツール | 比率の目安 | 件数 |
|---|---|---:|---:|
| Unit (純関数) | Vitest | 70% | 28 件前後 |
| Component / Integration (RTL + MSW) | Vitest | 25% | 14 件前後 |
| E2E (実ブラウザ + 実 GitHub API) | Playwright | 5% | 1 件 |

### この配分にした理由

- **Unit に重みを置く**: 本アプリの「壊れて困る」処理のほとんどは純関数 (数値整形・URL 解析・DTO 整形) に閉じている。msec オーダーで検証できるためコスパが圧倒的に良い。
- **Integration を薄く置く**: フォーム → URL → fetch → 表示の「結線」が壊れると単体では検出できない。ただし App Router 上で頻繁に書くと脆くなりがちなので、ピンポイントで絞る。
- **E2E を最小に絞る**: Playwright のセットアップコスト・実行時間・実 API のレート制限のトレードオフ。
  「検索 → 詳細 → 戻る」という主要フロー 1 本だけ流し、網羅は単体/結合に任せる。

---

## 3. 重点エリア (テストする)

### ★ `toRepositoryDetail` の watcher 数取り扱い (最重点)

**GitHub API の罠**:
`GET /repos/{owner}/{repo}` のレスポンスにある `watchers_count` は、歴史的経緯から実態として `stargazers_count` と同じ値を返します。
本来の Watcher 数 (= リポジトリを Subscribe している人数) は `subscribers_count` フィールドにあります。
`docs.github.com/rest/repos/repos#get-a-repository` および `github.com/orgs/community/discussions/24795` に明記されています。

**テスト**:
`src/features/repositories/domain/normalize.test.ts` の最重要ブロック。
- `watchers_count: 230_000` & `subscribers_count: 6_500` を入れ、出力 `watchersCount` が `6_500` であることを表明
- `subscribers_count: 0` のフォールバックも保証 (0 だからといって watchers に戻したりしない)
- `getRepository` 結合テストでも、API レスポンスから DTO まで一貫することを別途表明

**評価軸**: ドメイン知識を反映した、知らなければ書けないテスト。レビュアーへの最大のシグナル。

### GitHub API クライアントのエラーハンドリング (重点)

`src/features/repositories/data/github-client.test.ts` (8 件)。
- 200 / 401 / 404 / 422 のドメイン例外マッピング
- 429 と「403 + `X-RateLimit-Remaining: 0`」を **両方とも** `RateLimitError` として扱うこと
- 「403 (rate limit ヘッダなし)」だけは基底 `GitHubApiError` として扱うこと (権限エラーの可能性)
- ネットワーク失敗 (`fetch` reject) を `NetworkError` に詰め替えること

**評価軸**: 単純な happy path ではなく、レート制限/権限/ネットワークの **境界** に集中。MSW で HTTP 層をフルモック。

### URL = State の同期ロジック (重点)

`src/features/repositories/domain/search-query.test.ts` (11 件)、
`src/features/repositories/ui/search-bar.test.tsx` (4 件)、
`src/features/repositories/ui/pagination.test.ts` (6 件)。

- `parseSearchQuery`: 空 / 半角空白 / 配列 / 不正な page / 上限超過の clamp
- `calculateTotalPages`: 0 / PER_PAGE 境界 / Search API 上限 (1000件) クリップ
- SearchBar: 入力 → submit で `?q=...` push、page=N を URL から落とす、空文字で push しない
- Pagination の `buildPageItems`: 先頭・中央・末尾・隣接ページの ellipsis 配置

**評価軸**: URL = State の中核。崩れるとブックマーク・共有・履歴がすべて壊れる。

### Basic Auth 判定 (中重点)

`src/shared/auth/basic-auth.test.ts` (10 件)。

- 正しい credential → true、各種ずれ → false
- ヘッダ未指定 / Basic 以外スキーマ / 不正 base64 / コロンなし → false (例外を漏らさない)
- パスワードに `:` を含むケースの境界

**評価軸**: セキュリティ境界。proxy.ts (NextRequest/NextResponse) のテストではなく、判定ロジックを純関数化してそこを集中して守る。

### 数値フォーマッタ

`src/shared/lib/format-number.test.ts` (6 件)。
境界値 (999, 1000, 9999, 10000, 999_999, 1_000_000) を中心に。

---

## 4. テストしないエリアと理由

| 対象 | 理由 |
|---|---|
| Next.js のレンダリング機構自体 | フレームワークのテストになる |
| React の hooks の挙動 | 同上 |
| GitHub API のレスポンス形式そのもの | 外部 API の契約はこちらで担保しない |
| CSS / Tailwind の見た目 | snapshot は保守コストが効果に見合わない。試験範囲外 |
| `next/link` などの内部 navigation | フレームワーク提供物 |
| ビジュアルリグレッション | 試験範囲外 (拡張時は Chromatic 等) |
| ブラウザ互換性 | 同上 |
| パフォーマンス計測 | Vercel Analytics / Lighthouse の範疇 |
| Server Component の **直接レンダーテスト** | 公式が推奨しない (後述) |
| 検索結果一覧の `map` レンダー | フレームワーク機能。E2E + RepositoryCard の単独表示で十分 |
| ローディング状態 UI | `loading.tsx` は Next.js 機能。E2E のスモークで副次的に検証 |

---

## 5. ツール選定

| 選定 | 採用 | 理由 |
|---|---|---|
| **Vitest** vs Jest | Vitest 3.2.4 | Next.js v16 + ESM 時代では Vite ベースの Vitest が事実上の標準。Jest は ESM 周りの設定が多い。`@vitest/coverage-v8` も標準で整っている |
| **happy-dom** vs jsdom | happy-dom | Node 24 の最新で jsdom 29 のいくつかの依存に ESM 互換問題があったため。RTL は両方対応 |
| React Testing Library + jest-dom | 採用 | DOM/コンポーネントテストの de facto。実装詳細でなくユーザ視点で書ける |
| **Playwright** vs Cypress | Playwright 1.59 | Microsoft 製で Next.js との親和性が高い。並列実行・自動待機・CI 親和性で Cypress より優位。本リポジトリでは 1 本しか書かないが、選定理由として説明できる |
| **MSW** vs `vi.mock` | 両方を使い分け | API クライアントは MSW (HTTP 層 interception で本物に近い)。コンポーネントから API 関数をモックするときは vi.mock |
| Vitest config 拡張子 | `.mts` | Node 24 + Vite 7+ + Vitest 3 の組み合わせで `.ts` だと `require(ESM)` パスを通って ERR_REQUIRE_ESM が出るため、ESM ローダ確定の `.mts` を使用 |

### 設定上のひっかかり

`server-only` パッケージは `react-server` build condition 下でのみ no-op になる仕様。Vitest はその condition を設定しないため、`tests/server-only-stub.js` に alias して空モジュール化している (`vitest.config.mts` 参照)。

---

## 6. モック戦略

### GitHub API: MSW

`tests/mocks/handlers.ts` に共通ハンドラを集約 (現状は空の skeleton)。
個別テストは `server.use(...)` で必要なシナリオだけ上書きする運用。
`tests/setup.ts` の `onUnhandledRequest: "error"` により、想定外のネットワーク到達は即エラーで可視化。

### Server Component: 直接レンダーしない

Next.js 公式は Server Component の直接レンダーテストを **推奨していません**
(テスト用に React の RSC ランタイムを自前で用意することになるため、保守コストが見合わない)。

代わりに、Server Component の中身を **純関数として切り出して** 単体テストでカバーします:
- データ整形 → `domain/normalize.ts`
- URL パース → `domain/search-query.ts`
- 認証判定 → `shared/auth/basic-auth.ts`

これが本戦略の中核です。E2E がこれをまとめて結合検証します。

### proxy.ts (旧 middleware)

NextRequest/NextResponse のモックは煩雑なので、判定ロジックを `verifyBasicAuth` という純関数に切り出してそこを集中的にテスト。proxy.ts 本体は配線のみで、テスト対象から外します。

### next/navigation

SearchBar のテストでは `vi.mock("next/navigation", ...)` で `useRouter` / `useSearchParams` を差し替え、`router.push` を spy。

---

## 7. テストケースの代表例 (given-when-then)

### `toRepositoryDetail` (★ watcher の罠)

1. **given** `{ stargazers_count: 100, watchers_count: 100, subscribers_count: 7 }`
   **when** `toRepositoryDetail(raw)`
   **then** 戻り値の `watchersCount === 7`、`watchers_count` (=100) は採用されない
2. **given** 上記から `subscribers_count: 0` だけ変えた値
   **when** 同上
   **then** `watchersCount === 0` (0 を理由に watchers に fallback しない)
3. **given** `subscribers_count` と `watchers_count` が一致するケース
   **when** 同上
   **then** `subscribers_count` を採用 (たまたま値が同じだけで、選択は固定)

### GitHub API クライアント

1. **given** API が `403 + X-RateLimit-Remaining: 0` を返す
   **when** `githubFetch("/test")`
   **then** `RateLimitError` がスローされ、`resetAt` が `Date` で詰まる
2. **given** API が `403` を返す (rate limit ヘッダなし)
   **when** 同上
   **then** **基底** `GitHubApiError` がスローされる (RateLimitError ではない)

### SearchBar (URL 同期)

1. **given** URL が `?q=old&page=3` で SearchBar をレンダー
   **when** 入力を "next.js" に変えて submit
   **then** `router.push("/repositories?q=next.js")` が呼ばれる (page は URL から落ちる)
2. **given** 半角空白 `"   "` で submit
   **when** クリック
   **then** `router.push` は呼ばれない

### Basic Auth

1. **given** `Authorization: Basic ` + `btoa("demo:p4ssw0rd!")`、credential `{user:"demo", password:"p4ssw0rd!"}`
   **when** `verifyBasicAuth(header, credential)`
   **then** `true`
2. **given** `Authorization: Bearer ...`
   **when** 同上
   **then** `false`

詳細はテストファイル本体を参照してください。

---

## 8. 実行方法

```bash
# 単体・結合テスト
pnpm test                # 1 回実行
pnpm test:watch          # watch モード
pnpm test:coverage       # カバレッジレポート (text + html)

# E2E
pnpm test:e2e            # コマンドライン
pnpm test:e2e:ui         # Playwright UI モード

# 静的検査
pnpm lint                # ESLint
pnpm typecheck           # tsc --noEmit
pnpm format:check        # Prettier
```

CI (GitHub Actions, `.github/workflows/ci.yml`) は static-checks → e2e の 2 ジョブで上記を順に実行します。
PR では失敗時に Playwright report を artifact 保存します。

---

## 9. 拡張する場合の方針

| 拡張 | アプローチ |
|---|---|
| ビジュアルリグレッション | Storybook + Chromatic を別ジョブで追加。本ドキュメントでは試験範囲外として除外 |
| 契約テスト (GitHub API スキーマ drift 検知) | `@octokit/openapi-types` の最新と DTO の付き合わせを CI に挟む。年 1 回回せば十分 |
| アクセシビリティ自動検査 | axe-core をコンポーネントテストに混ぜる。RepositoryCard / Pagination から開始 |
| 国際化対応時 | i18n キーの未訳検出を typecheck に組み込む。Snapshot 化はしない |
| 認証を本番化する場合 | NextAuth.js + IdP (GitHub OAuth等) に置き換え。proxy.ts は薄いので差し替えは部分的で済む |

---

## 10. Appendix

### 10.1 watcher_count vs subscribers_count

GitHub Docs 抜粋:
> `watchers_count` is intentionally returned to maintain backward compatibility with v3.

つまり `watchers_count` は **後方互換のために** 残されているフィールドで、**実態は star 数**。
本来の意味の Watcher 数 (= 通知を購読している人数) は `subscribers_count` です。
リポジトリページの "Watch" ボタンが操作するのもこちら。

参考リンク:
- https://docs.github.com/en/rest/repos/repos#get-a-repository
- https://github.com/orgs/community/discussions/24795

### 10.2 GitHub Search API のレート制限

| 認証状態 | 全体 | Search エンドポイント |
|---|---:|---:|
| 未認証 | 60 req/h | 10 req/min |
| 認証付 (PAT) | 5000 req/h | 30 req/min |

本アプリは `revalidate: 60` で同一クエリのキャッシュ再利用を期待し、Vercel での実運用では 5000 req/h の中で十分回ります。
鍵は `GITHUB_TOKEN` を Vercel env に設定すること。

---

## 30 秒で説明する場合 (面接用要約)

> カバレッジを稼ぐより、3 箇所に集中しました。
> 1 つ目は GitHub API クライアントのエラー分岐 — 特に「403 + X-RateLimit-Remaining: 0」を権限エラーと区別する処理。
> 2 つ目は URL を SSoT にする検索とページネーションの同期。
> 3 つ目は最重要で、詳細ページの Watcher 数。
> GitHub API の `watchers_count` は実態が star と同値で、真の Watcher 数は `subscribers_count` なので、この取り違えを防ぐ純関数テストを書きました。
> Server Component は公式が直接レンダーテストを推奨していないため、ロジックを純関数に切り出して単体テストでカバーする方針です。
> E2E は検索 → 詳細のスモーク 1 本だけにして保守コストを抑えています。
