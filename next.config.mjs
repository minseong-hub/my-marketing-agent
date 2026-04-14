/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // better-sqlite3 네이티브 모듈 설정
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
};

export default nextConfig;
