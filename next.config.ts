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
    'antd',
    '@ant-design/icons',
    'rc-util',
    'rc-pagination',
    'rc-picker'
  ],
};

export default nextConfig;
