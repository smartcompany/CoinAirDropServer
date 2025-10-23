/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Reduce memory usage during build
  swcMinify: true,
  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable .txt file imports
  webpack: (config) => {
    config.module.rules.push({
      test: /\.txt$/,
      use: 'raw-loader',
    });
    return config;
  },
};

module.exports = nextConfig;
