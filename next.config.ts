import type { NextConfig } from "next";

/**
 * Next.js v16 設定。
 *
 * - images.remotePatterns: GitHub のアバターを <Image> で安全に最適化するため、
 *   `avatars.githubusercontent.com` を許可する。v16 で `images.domains` は廃止
 *   されたため、新しい `remotePatterns` を使う。
 * - reactStrictMode: 開発時にライフサイクルの罠を早期発見するため有効化。
 * - poweredByHeader: 不要な情報露出を避けるため無効化。
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
    ],
  },
};

export default nextConfig;
