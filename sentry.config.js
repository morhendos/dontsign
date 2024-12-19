// This file configures the initialization of Sentry for edge and server.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,
  // Enable session replay in production only
  enabled: process.env.NODE_ENV === 'production',
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});