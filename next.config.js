/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
  },
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  // 优化构建输出
  swcMinify: true,
  // 启用压缩
  compress: true,
  // 生产环境优化
  poweredByHeader: false,
  // 环境变量
  env: {
    APP_NAME: '心情守护',
    APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig