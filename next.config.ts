import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Deshabilitar temporalmente la optimización de imágenes para depuración
  images: {
    // Dominios permitidos para optimización de imágenes
    domains: [
      'tqldpcqcovilgpmzeyre.supabase.co',
      'tqldpcqcovilgpmzeyre.supabase.in',
      'images.unsplash.com',
      'localhost'
    ],
    // Deshabilitar la optimización de imágenes para depuración
    unoptimized: true,
    // Configuración de tamaños de imagen
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Permitir SVGs
    dangerouslyAllowSVG: true,
    // Política de seguridad de contenido
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuración de formato de imagen
    formats: ['image/webp'],
    // Configuración de caché
    minimumCacheTTL: 60,
  },
  
  // Enable server actions with body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Turbopack configuration
  turbopack: {
    // Empty config to silence the warning
  },
  
  // Webpack configuration for local image handling
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|svg)$/i,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
