/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Fix for pdf.worker.js not found
      'pdfjs-dist': 'pdfjs-dist/build',
    };
    return config;
  },
};

module.exports = nextConfig;
