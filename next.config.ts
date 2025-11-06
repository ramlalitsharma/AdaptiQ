import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Exclude Netlify functions from Next.js TypeScript compilation
    ignoreBuildErrors: false,
  },
  // Exclude netlify folder from webpack build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
