/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ag-grid-community/core'],
  output: 'standalone',
  images: {
    unoptimized: true
  },
  // 確保所有路由都能正確處理
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;  // 如果用 next.config.js

// 或
// export default nextConfig;  // 如果用 next.config.mjs
