/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  trailingSlash: true,
  basePath: '',
  assetPrefix: './',
};

module.exports = nextConfig;
