import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
        // Fix for "Module not found: Can't resolve 'async_hooks'"
        // This is a server-side module that shouldn't be bundled in the client.
        config.resolve.fallback = {
            ...config.resolve.fallback,
            async_hooks: false,
        };
    }
    return config;
  },
};

export default nextConfig;
