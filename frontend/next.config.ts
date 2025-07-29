// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.licdn.com'],
    // OR for Next.js 13+:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.licdn.com',
      },
    ],
  },
};

export default nextConfig;