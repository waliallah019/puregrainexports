/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Netlify (SSR + App Router support)
  output: "standalone",

  // Keep your existing settings
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
