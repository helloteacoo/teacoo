/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ag-grid-community/core'],
  output: 'standalone',
  images: {
    unoptimized: true
  },
  experimental: {
    appDir: true
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ]
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

module.exports = nextConfig;  // 如果用 next.config.js

// 或
// export default nextConfig;  // 如果用 next.config.mjs
