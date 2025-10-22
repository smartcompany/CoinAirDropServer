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
}

export default nextConfig

