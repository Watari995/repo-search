/**
 * MSW のサーバ側ランタイム (Node.js)。
 * Vitest からのみ参照する。ブラウザ用の worker は今回は用意しない
 * (開発時は実 GitHub API に当てる方針のため)。
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
