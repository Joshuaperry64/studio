import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Your existing Next.js config options might be here

  // Add the following webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-side modules from the client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false, // Tells webpack to ignore 'async_hooks'
        sqlite3: false,     // Also good to ignore the native driver
      };
    }

    return config;
  },
};

export default nextConfig;