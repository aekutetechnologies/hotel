/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: 'api/media/**',
      },
      {
        protocol: 'http',
        hostname: '147.93.97.63',
        pathname: '/api/media/**',
      },
    ],
  },
  eslint: {
    // Warning: This allows builds to complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
