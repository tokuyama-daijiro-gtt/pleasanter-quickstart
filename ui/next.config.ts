import type { NextConfig } from "next";

const pleasanterInternalUrl =
  process.env.PLEASANTER_INTERNAL_URL ?? "http://pleasanter:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/pleasanter/:path*",
        destination: `${pleasanterInternalUrl}/:path*`
      }
    ];
  }
};

export default nextConfig;
