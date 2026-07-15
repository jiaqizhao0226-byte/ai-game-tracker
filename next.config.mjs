/** @type {import('next').NextConfig} */
// Cloudflare Pages 在根路径伺服，不需要 basePath/assetPrefix
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
