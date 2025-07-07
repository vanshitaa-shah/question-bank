import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 15: External packages for server components
  serverExternalPackages: ["mongoose"],
  
  // Next.js 15: Turbopack configuration
  turbopack: {
    rules: {
      '*.tsx': {
        loaders: ['tsx'],
        as: '*.tsx',
      },
    },
  },

  // Next.js 15: Enhanced experimental features (only stable ones)
  experimental: {
    // React 19 support
    reactCompiler: true,
  },

  // Enhanced TypeScript configuration
  typescript: {
    // Don't build if there are TypeScript errors
    ignoreBuildErrors: false,
  },

  // Enhanced ESLint configuration
  eslint: {
    // Don't build if there are ESLint errors
    ignoreDuringBuilds: false,
  },

  // Enhanced caching and performance
  cacheHandler: undefined, // Use default Next.js cache
  
  // Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enhanced bundling
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle in production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize React for production
        'react/jsx-runtime': 'react/jsx-runtime.js',
      };
    }

    return config;
  },

  // Enhanced headers for better performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // Enhanced compression
  compress: true,

  // Enhanced poweredBy header
  poweredByHeader: false,
};

export default nextConfig;
