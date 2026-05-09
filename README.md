# repo-search

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](.github/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](tsconfig.json)
[![Tests](https://img.shields.io/badge/tests-56%20passing-success)](docs/test-strategy.md)

GitHub Search API を用いた **リポジトリ検索 Web アプリ**。
ある企業の技術試験課題として、Next.js 16 (App Router) + TypeScript + Tailwind v4 で実装しました。

> 🎯 **評価軸を意識した設計**: コードの動作は前提として、設計判断・テスト戦略・コミット粒度・ドキュメントを面接官に説明できる状態を最優先しました。
> 詳しい背景は本 README と [`docs/test-strategy.md`](docs/test-strategy.md) を参照してください。

---

## 機能

- キーワードでリポジトリを検索 (GitHub Search API)
- 検索結果一覧 (Octicons + GitHub 風カード, ページネーション)
- 詳細ページ: リポジトリ名 / オーナーアバター / 言語 / Star / **Watcher** / Fork / Issue
- ライト / ダークモード切替 (next-themes、GitHub Primer 配色)
- Basic Auth ゲート (Vercel 上でも誰でも触れる「鍵付きデモ」を実現)
- 検索 → 詳細 → 戻る で検索状態 (?q=...) を保持

---

## デモ

- **URL**: <https://repo-search-xi.vercel.app>
- **Basic Auth**:
  - User: `demo`
  - Password: `BhjbmDJ1LC4axga4`
- **ヘルスチェック**: <https://repo-search-xi.vercel.app/api/health> (認証バイパス)

> 注: デモ認証情報は本リポジトリの公開時のものです。
> 必要に応じて Vercel ダッシュボードからローテーションしてください。

---

## クイックスタート

### 前提

- Node.js 20.9+ / pnpm 10+
- (任意) GitHub Personal Access Token (レート制限緩和用)

### セットアップ

```bash
# 依存インストール (Playwright のブラウザは別途 install コマンドが必要)
pnpm install
pnpm exec playwright install chromium

# 環境変数を雛形からコピー
cp .env.example .env.local

# 開発サーバ起動
pnpm dev
# http://localhost:3000 を開く
```

### 環境変数

| 変数                   | 必須? | 用途                                                                          |
| ---------------------- | ----- | ----------------------------------------------------------------------------- |
| `BASIC_AUTH_USER`      | 任意  | Basic Auth のユーザ名。両方揃った場合のみ認証ゲートが有効化                   |
| `BASIC_AUTH_PASSWORD`  | 任意  | Basic Auth のパスワード (8 文字以上)                                          |
| `GITHUB_TOKEN`         | 推奨  | API レート制限を 60→5000 req/h に緩和。スコープは無印 or `public_repo` で十分 |
| `NEXT_PUBLIC_SITE_URL` | 任意  | 動的 OGP の絶対 URL 解決用。Vercel では本番 URL を設定                        |

`.env.local` は gitignore 済み。空文字 (`""`) は **未設定** と同じ扱いです。

---

## 実行コマンド

```bash
pnpm dev                 # 開発サーバ
pnpm build               # 本番ビルド
pnpm start               # 本番ビルドの起動

pnpm lint                # ESLint
pnpm typecheck           # TypeScript の型検査
pnpm format              # Prettier で自動整形
pnpm format:check        # 整形差分チェック (CI 用)

pnpm test                # 単体・結合 (Vitest)
pnpm test:watch          # watch モード
pnpm test:coverage       # カバレッジ
pnpm test:e2e            # Playwright E2E
pnpm test:e2e:ui         # Playwright UI モード
```

pre-commit フックで `lint --fix` + `prettier --write` が自動実行されます (simple-git-hooks + lint-staged)。

---

## ディレクトリ構成

```
src/
├── app/                              # Next.js App Router (薄い endpoint 層)
│   ├── layout.tsx                    # 全体レイアウト + ThemeProvider
│   ├── page.tsx                      # / → /repositories へ redirect
│   ├── repositories/
│   │   ├── layout.tsx                # ヘッダ + 検索バー (永続)
│   │   ├── page.tsx                  # 検索結果一覧 (Server Component)
│   │   ├── loading.tsx               # Skeleton (Suspense fallback)
│   │   ├── error.tsx                 # エラーバウンダリ (use client)
│   │   └── [owner]/[repo]/
│   │       ├── page.tsx              # 詳細 (SSR + generateMetadata)
│   │       ├── loading.tsx
│   │       └── error.tsx
│   └── api/health/route.ts           # ヘルスチェック (認証バイパス)
│
├── features/repositories/            # ★ 機能の実装本体
│   ├── domain/                       # 純関数: 型・正規化・URL クエリ
│   │   ├── repository.ts
│   │   ├── normalize.ts              # ★ watcher_count の罠を吸収
│   │   └── search-query.ts
│   ├── data/                         # GitHub API クライアント (server-only)
│   │   ├── github-client.ts          # fetch wrapper + 例外マッピング
│   │   ├── search-repositories.ts
│   │   ├── get-repository.ts
│   │   └── errors.ts                 # 例外型階層
│   └── ui/                           # 表示コンポーネント
│       ├── app-header.tsx
│       ├── search-bar.tsx
│       ├── repository-list.tsx
│       ├── repository-card.tsx
│       ├── repository-card-skeleton.tsx
│       ├── repository-detail-view.tsx
│       ├── back-to-results.tsx
│       ├── pagination.tsx
│       ├── empty-state.tsx
│       └── rate-limit-notice.tsx
│
├── shared/
│   ├── ui/                           # 横断 UI (Skeleton / ThemeToggle 等)
│   ├── lib/                          # 横断ユーティリティ (env / format-number)
│   └── auth/basic-auth.ts            # 認証判定の純関数
│
└── proxy.ts                          # Basic Auth ゲート (v16: 旧 middleware.ts)

tests/
├── e2e/search-flow.spec.ts           # Playwright スモーク 1 本
├── mocks/                            # MSW handlers + server
└── setup.ts                          # Vitest setup
```

### Feature-based を選んだ理由

Clean Architecture の 4 層 (domain / usecase / infrastructure / presentation) を厳格に適用すると、各層に 1〜2 ファイルしか入らず **抽象化のための抽象化** になります。
本アプリは「リポジトリ検索」という単一機能のため、`features/repositories/{domain,data,ui}` の **緩やかなレイヤリング** を選びました。
依存方向は `ui → data → domain` に固定し、逆流させない原則だけ守っています。
規模の拡大時に Clean Arch に格上げするのも容易な構造です。

---

## 工夫した点 / こだわったポイント

### 1. **Server Component first / URL = State**

検索結果はサーバから取得するため、クライアント状態管理 (Zustand 等) は **入れていません**。
URL の `?q=...&page=...` を Single Source of Truth として、`searchParams` を読む Server Component が自動再描画されます。

これにより:

- **ブックマーク・共有可能な URL** (検索状態の復元が無料)
- **JS 無効でも検索が動く** (`<form method="GET" action="/repositories">`)
- **クライアントバンドル最小化** (検索結果カードもすべて Server Component)
- **Next.js の Streaming** が活きる (`<Suspense>` + `loading.tsx` でヘッダは即時、結果は流れて差し替わる)

### 2. **GitHub API の「watcher_count の罠」への対応** ★

`GET /repos/{owner}/{repo}` のレスポンスにある `watchers_count` は、後方互換のために **stargazers_count と同値** を返します。
本来の Watcher 数 (= リポジトリを Subscribe している人数) は `subscribers_count` フィールドに格納されています。

[`src/features/repositories/domain/normalize.ts`](src/features/repositories/domain/normalize.ts) の `toRepositoryDetail` で **`subscribers_count` を採用** し、UI の `Watchers` 表示が直感に合う値になるようにしています。
専用テスト ([`normalize.test.ts`](src/features/repositories/domain/normalize.test.ts)) でこの取り違えに対する回帰防止を効かせています。
独立コミット (`fix: Watcher 数を subscribers_count から取得`) も切ってあり、コミット履歴からも追跡可能です。

> 参考: <https://github.com/orgs/community/discussions/24795>

### 3. **状態管理ライブラリゼロ**

| 状態種別               | 配置先                                   |
| ---------------------- | ---------------------------------------- |
| 検索クエリ・ページ番号 | URL `searchParams`                       |
| 検索結果データ         | Server Component の fetch 戻り値 (props) |
| ローディング           | `loading.tsx` + Suspense                 |
| エラー                 | `error.tsx` (error boundary)             |
| 検索バーの一時入力     | コンポーネントローカル `useState`        |
| テーマ (dark/light)    | `next-themes` (cookie/localStorage)      |

「サーバから来るデータをクライアント状態にコピーしない」が原則です。

### 4. **GitHub UI 踏襲: Octicons + Primer 配色**

GitHub 純正アイコン (`@primer/octicons-react`) と Primer Design System の色トークンを Tailwind v4 の `@theme inline` に写経。`bg-canvas-default`、`text-fg-muted` などのユーティリティで GitHub の見た目を再現しています。

### 5. **データ層の例外型階層**

403 のレート制限と通常の権限エラーをアプリ側で峻別する必要があるため、`GitHubApiError` を基底に `RateLimitError` / `UnauthorizedError` / `NotFoundError` / `ValidationError` / `NetworkError` の型階層を定義。
レート制限時は専用の `RateLimitNotice` で残時間を表示します ([`src/features/repositories/data/errors.ts`](src/features/repositories/data/errors.ts))。

### 6. **テスト戦略のこだわり**

カバレッジ稼ぎではなく、3 つの重点領域に集中:

1. `toRepositoryDetail` の watcher 取り違え防止 (★ ドメイン知識テスト)
2. GitHub API クライアントのエラー分岐 (403 + ヘッダ vs 普通の 403、429 等)
3. URL = State の同期 (検索バー / ページネーション)

詳細と判断根拠は **[docs/test-strategy.md](docs/test-strategy.md)** に集約しました。
56 件のテスト (Vitest 8 ファイル + Playwright 1 本) で、それぞれの目的を明示しています。

### 7. **コミット粒度**

23 個のコミットを Conventional Commits + 日本語で記述。
1 コミット = 動く / レビュー可能な単位とし、特に「watcher_count → subscribers_count の修正」は **独立した `fix:` コミット** として残しているので、面接でリンクを示しながら経緯を説明できます。

```
fix: Watcher 数を subscribers_count から取得 (GitHub API 仕様への対応)
test: 詳細ページのデータ整形テスト (watcher 数の罠を含む)
```

---

## Next.js v16 で活用した機能

| 機能                                 | 利用箇所         | 採用意図 (コード内コメントにも明記)                |
| ------------------------------------ | ---------------- | -------------------------------------------------- |
| Server Components                    | 全ページ既定     | API キー保護、JS バンドル削減、TTFB 改善           |
| `<Suspense>` + Streaming             | 結果リスト       | ヘッダ・検索バーは即時、結果のみ流れて差し替え     |
| `loading.tsx` / `error.tsx`          | 各ルート         | Skeleton と局所エラー処理                          |
| `generateMetadata`                   | 詳細ページ       | 動的 OGP (Twitter Card 含む)                       |
| `<Image>` (avatar)                   | 一覧・詳細       | WebP 自動変換、LCP 改善                            |
| `<Link>` prefetch                    | 一覧 → 詳細      | viewport 内 Link を自動 prefetch で即遷移          |
| `next/font` (Inter / JetBrains Mono) | layout           | self-host で CLS 防止                              |
| `fetch` + `revalidate`               | API クライアント | 検索 60s / 詳細 300s で ISR 的キャッシュ           |
| async `searchParams`                 | 一覧ページ       | URL = State 基盤 (v15+ から Promise に変わった点)  |
| `import "server-only"`               | github-client    | 誤クライアント import を build 時に弾く            |
| **`proxy.ts`** (旧 middleware)       | 認証ゲート       | v16 で middleware は deprecated → proxy に renamed |
| `<Image>` の `remotePatterns`        | next.config.ts   | v16 で `domains` は廃止                            |

意図的に **使わなかった** もの:

- Server Action (今回は `<form method="GET">` で URL に流す方が原則と一致)
- `cacheComponents` / dynamicIO (まだ stable でないため明示的 `revalidate` を選択)
- Zustand 等の状態管理ライブラリ (URL = State で不要)

---

## デプロイ (Vercel)

### 手順

1. このリポジトリを GitHub に push (本リポジトリそのまま)
2. <https://vercel.com/new> から GitHub リポジトリを Import
3. 環境変数を Production / Preview に設定
   - `BASIC_AUTH_USER` (例: `demo`)
   - `BASIC_AUTH_PASSWORD` (8 文字以上)
   - `GITHUB_TOKEN` (Personal Access Token, 推奨)
   - `NEXT_PUBLIC_SITE_URL` (本番ドメイン)
4. Deploy

ローカルから直接デプロイする場合:

```bash
pnpm dlx vercel link
pnpm dlx vercel env add BASIC_AUTH_USER production
pnpm dlx vercel env add BASIC_AUTH_PASSWORD production
pnpm dlx vercel env add GITHUB_TOKEN production
pnpm dlx vercel env add NEXT_PUBLIC_SITE_URL production
pnpm dlx vercel --prod
```

### ヘルスチェック

`/api/health` は Basic Auth ゲートをバイパスしているので、Vercel の uptime 監視や CDN チェックから 200 を取得できます。

```bash
curl https://<your-domain>/api/health
# {"status":"ok","at":"2026-..."}
```

---

## 既知の限界と本番化指針

| 項目             | 現状                                   | 本番化するなら                                                      |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------- |
| 認証             | Basic Auth (平文 base64)               | NextAuth.js + IdP (Google / GitHub OAuth)、レートリミット付き       |
| レート制限       | `GITHUB_TOKEN` で 5000 req/h           | Vercel KV や Edge Config で API レイヤキャッシュ + ユーザ単位 quota |
| エラー監視       | `console.error` + Next.js デフォルト   | Sentry / Datadog 等にエラーと digest を送信                         |
| 国際化           | 英語 UI (GitHub 踏襲) + 日本語コメント | next-intl + 翻訳キー化                                              |
| アクセシビリティ | aria-label / role / focus-visible 程度 | axe-core を CI に挟む、コントラスト精査                             |
| セキュリティ     | Basic Auth + `import 'server-only'`    | CSP / X-Frame-Options ヘッダの明示、Token rotation                  |

---

## AI の活用方針

本課題の取り組みでは、**AI を「速度倍率」として使い、判断は自分で持つ** ことを意識しました。

### AI に任せた範囲

- create-next-app のスキャフォールドおよび最初のボイラープレート整理
- ユーティリティ関数の実装下書き (`format-number.ts`、`buildPageItems` 等)
- Tailwind クラスの並び (prettier-plugin-tailwindcss も含めた整形)
- ドキュメントの文体整え・節立て (本 README と [`docs/test-strategy.md`](docs/test-strategy.md) のドラフト)
- テストケースの列挙の補助 (境界値の洗い出し)

### 自分で判断・主導した範囲

- 設計方針の選定 (feature-based vs Clean Arch、Server Component first、URL = State、状態管理ライブラリ不採用)
- 認証方式の選定 (Basic Auth / NextAuth / セッション cookie の比較と Basic Auth 採用)
- ページネーション vs 無限スクロールの比較と選定根拠
- **テスト戦略**: 何をテストし何をしないか、重点領域 3 つの選定 (テスト戦略ドキュメント全体)
- **`watchers_count` の罠** の発見・調査・対応設計 (独立 fix コミットを切る判断含む)
- コミット粒度・順序の設計 (Phase 0〜5 を 23 個に分割)
- v16 の breaking changes (proxy.ts / async searchParams 等) への対応判断
- ESLint / Prettier / lint-staged / pre-commit / CI の組み込み

### AI と対話して詰めた範囲

- GitHub API のレート制限分岐ロジック (403 + ヘッダ vs 429 vs 単純 403)
- 例外型階層の粒度
- Server Component のテスト方針 (公式の推奨を踏まえ「純関数化して単体テスト」)
- Vitest 4 + Vite 8 + Node 24 の互換問題切り分けと回避策

「全部 AI で書きました」感を避けつつ嘘も書かない、という塩梅で記載しています。
コードを動かしながら進めた経緯はコミット履歴 (`git log`) からも追えます。

---

## 参考リンク

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [GitHub Search API](https://docs.github.com/en/rest/search)
- [Primer Design System](https://primer.style/)
- [watcher_count vs subscribers_count discussion](https://github.com/orgs/community/discussions/24795)

## License

MIT
