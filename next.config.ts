import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'genkit',
    '@genkit-ai/googleai',
    '@genkit-ai/core',
    'express',
    'require-in-the-middle',
    '@opentelemetry/sdk-node',
    '@opentelemetry/instrumentation',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pubgmobile.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.apks.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        message: /@tailwindcss\/line-clamp plugin is now included by default/i,
      },
      {
        module: /express[\\/]lib[\\/]view\.js/,
        message: /Critical dependency: the request of a dependency is an expression/i,
      },
      {
        module: /require-in-the-middle[\\/]index\.js/,
        message:
          /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/i,
      },
    ];

    return config;
  },
};

export default nextConfig;
