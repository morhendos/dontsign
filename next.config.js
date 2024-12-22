/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Make sure we're using the legacy build of PDF.js
      'pdfjs-dist': 'pdfjs-dist/legacy/build',
    };
    return config;
  },
};

module.exports = nextConfig;
