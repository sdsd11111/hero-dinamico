/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'tqldpcqcovilgpmzeyre.supabase.co',
      'tqldpcqcovilgpmzeyre.supabase.in',
      'images.unsplash.com',
      'localhost'
    ],
    minimumCacheTTL: 60,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  trailingSlash: false,
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
        source: '/(.*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
