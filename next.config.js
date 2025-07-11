/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: { unoptimized: true },
  env: {
    NEXTAUTH_URL: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/db',
  },
  // Make sure all environment variables are available during the build
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      querystring: require.resolve('querystring-es3'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      os: require.resolve('os-browserify'),
      url: require.resolve('url'),
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
    };
    return config;
  },
};

module.exports = withPWA(nextConfig);
