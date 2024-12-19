const { withSentryConfig } = require("@sentry/nextjs");
const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
        encoding: false,
      };
    }

    // Add rule for PDF.js worker
    config.module.rules.push({
      test: /pdf\.worker\.min\.js/,
      type: 'asset/resource',
    });

    return config;
  },
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

module.exports = withSentryConfig(
  nextConfig,
  sentryWebpackPluginOptions
);
