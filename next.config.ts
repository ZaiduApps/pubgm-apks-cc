import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 爬虫必须在初始 HTML head 中拿到 title、description 和 canonical，避免
  // Next.js 流式 metadata 追加到 body 后被 Bing 的首轮抓取遗漏。
  htmlLimitedBots:
    /bot|crawler|spider|bingpreview|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp/i,
  serverExternalPackages: [
    'genkit',
    '@genkit-ai/googleai',
    '@genkit-ai/core',
    'express',
    'require-in-the-middle',
    '@opentelemetry/sdk-node',
    '@opentelemetry/instrumentation',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
        ],
      },
    ];
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
