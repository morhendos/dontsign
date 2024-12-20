/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  webpack: (config) => {
    // Handle canvas dependency for PDF.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false
    };
    return config;
  }
}

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(
  nextConfig,
  { hideSourceMaps: true }
);