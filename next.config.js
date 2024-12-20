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
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false
}

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Enables automatic instrumentation of Next.js server functions
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/
    autoInstrumentServerFunctions: true,

    // Upload sourcemaps to Sentry but hide them from browser
    hideSourceMaps: true,

    // Settings for performance monitoring
    tracesSampleRate: 0.1,
    tracingOrigins: ["localhost", /^\//, process.env.NEXT_PUBLIC_VERCEL_URL],
  }
);