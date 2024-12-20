// This file configures the initialization of Sentry on the client side
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Adjust this value in production
  tracesSampleRate: 0.1,
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Disable the default integrations
  defaultIntegrations: false,
});