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

const sentryWebpackPluginOptions = {
  // Additional Sentry webpack plugin options
  silent: true,
  // Hide source maps from the browser
  hideSourceMaps: true,
  // Automatically create releases based on git info
  autoInstrumentServerFunctions: true,
  // Enable automatic instrumentation of Next.js server functions
  autoInstrumentMiddleware: true,
  // Enable performance monitoring
  tracesSampleRate: 0.1
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(
  nextConfig,
  sentryWebpackPluginOptions
);