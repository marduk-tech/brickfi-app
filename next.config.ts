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
      // TEMP: maintenance - every page goes to the home page, which shows
      // src/app/maintenance.tsx. Skips Next internals, static files (anything
      // with an extension), the service worker's /offline page and
      // /app/brickchat (that exact path, not its threads).
      // "/:path((?!_next/|offline$|app/brickchat$|.*\\.).+)",
      "/brkassistv2",
      "/buy-with-brickfi",
    ]
      .map((source) => ({ source, destination: "/", permanent: false }))
      .concat(
        // callback landings - straight to brickchat with the expert help
        // dialog open on the call option (see the reachout param in
        // brickchat-client.tsx); a query string on the source (e.g.
        // ?srcIntent=) is carried over
        ["/brickassist", "/callback-request"].map((source) => ({
          source,
          destination: "/app/brickchat?reachout=callback",
          permanent: true,
        })),
      );
  },
  // static legal pages in public/docs, served without the .html suffix - for
  // `next dev`; on Netlify the same rewrites are in netlify.toml
  async rewrites() {
    return [
      { source: "/privacy", destination: "/docs/privacy.html" },
      { source: "/terms", destination: "/docs/terms.html" },
    ];
  },
};

export default nextConfig;
