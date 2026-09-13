/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer uses canvas and other Node.js APIs not available in Edge runtime
  // Ensure PDF API route runs in Node.js runtime (default for App Router)
  serverExternalPackages: ["@react-pdf/renderer", "canvas"],

  // Suppress harmless punycode deprecation warning from whoiser dependency
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
    ];
    return config;
  },
};

export default nextConfig;
