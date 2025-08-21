import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    'rc-util',
    'rc-pagination',
    'rc-picker'
  ],
};

export default nextConfig;
