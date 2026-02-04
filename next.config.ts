import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for Edge optimization
  experimental: {
    // Optimize package imports for smaller Edge bundles
    optimizePackageImports: ['framer-motion', '@supabase/supabase-js'],
  },
  
  // Configure headers for better caching
  async headers() {
    return [
      {
        // Cache API routes on Edge
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
