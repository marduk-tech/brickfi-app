import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Removed output: 'export' for development - enables dynamic routing
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "antd",
    "@ant-design/icons",
    "rc-util",
    "rc-pagination",
    "rc-picker",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // retired landing pages - sent to the home page (redirects run before the
  // filesystem routes, so their page.tsx files are never reached)
  async redirects() {
    return [
      "/brickassist",
      "/brkassistv2",
      "/buy-with-brickfi",
      "/requestreport",
      "/callback-request",
    ].map(
      (source) => ({ source, destination: "/", permanent: false }),
    );
  },
};

export default nextConfig;
