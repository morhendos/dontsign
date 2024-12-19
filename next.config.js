const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // your existing next config
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: "your-org-name",
  project: "dontsign",
};

module.exports = withSentryConfig(
  nextConfig,
  sentryWebpackPluginOptions
);