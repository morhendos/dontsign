/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Disable canvas in Node.js environment
    if (isServer) {
      config.resolve.alias.canvas = false;
    }

    // Configure worker loading
    config.resolve.alias['pdfjs-dist/build/pdf.worker.entry'] = 
      'pdfjs-dist/build/pdf.worker.min.js';

    return config;
  },
};

export default nextConfig;
