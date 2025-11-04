/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'tqldpcqcovilgpmzeyre.supabase.co',
      'tqldpcqcovilgpmzeyre.supabase.in',
      'images.unsplash.com',
      'localhost'
    ]
  },
  experimental: {
    serverActions: true
  },
  output: 'standalone'
}

export default nextConfig;
