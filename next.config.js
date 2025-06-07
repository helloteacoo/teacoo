/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ag-grid-community/core'],
};

module.exports = nextConfig;  // 如果用 next.config.js

// 或
// export default nextConfig;  // 如果用 next.config.mjs
