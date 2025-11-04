/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tqldpcqcovilgpmzeyre.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'tqldpcqcovilgpmzeyre.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    minimumCacheTTL: 60,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración para manejar rutas no encontradas
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
