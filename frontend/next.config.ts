import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep metadata in <head> for audits and non-JavaScript crawlers.
  htmlLimitedBots: /.*/,
  experimental: {
    serverActions: {
      bodySizeLimit: "512kb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/t/p/w500/**",
        search: "",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
