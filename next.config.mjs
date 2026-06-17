/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/ai-game-tracker',
  assetPrefix: '/ai-game-tracker/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
