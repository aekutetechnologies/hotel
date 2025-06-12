/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable React Strict Mode to avoid double-mounting issues with Leaflet
  reactStrictMode: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '147.93.97.63',
        pathname: '/api/media/**',
      },
           {
        protocol: 'https',
        hostname: 'hsquareliving.com',
        pathname: '/api/media/**',
      },
      {
        protocol: 'http',
        hostname: 'hsquareliving.in',
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
