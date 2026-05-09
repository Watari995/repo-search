// `server-only` の Vitest 用スタブ。
//
// 本来は React Server Components のビルド条件 (`react-server`) で empty に解決
// されるが、Vitest はその条件を設定しないため、デフォルトの index.js (= throw)
// を引いてしまう。テスト中はサーバ/クライアントの境界を意識しないので、
// この空モジュールに alias して無効化する。
