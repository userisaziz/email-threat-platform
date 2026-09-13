/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @react-pdf/renderer uses canvas and other Node.js APIs not available in Edge runtime
    serverComponentsExternalPackages: ["@react-pdf/renderer", "canvas"],
  },

  // Suppress harmless punycode deprecation warning from whoiser dependency
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
    ];
    return config;
  },
};

export default nextConfig;
