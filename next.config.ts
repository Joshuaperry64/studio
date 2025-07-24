import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude all server-side modules from the client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        dns: false,
        fs: false,
        http2: false,
        net: false,
        tls: false,
        'fs/promises': false,
        'node:fs': false,
        'node:net': false
      };
    }

    return config;
  },
};

export default nextConfig;