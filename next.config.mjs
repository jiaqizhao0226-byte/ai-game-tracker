/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/ai-game-tracker' : '',
  assetPrefix: isProd ? '/ai-game-tracker/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
