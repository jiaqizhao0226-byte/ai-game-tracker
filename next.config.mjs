/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "pdf-parse"],
  },
};

export default nextConfig;
