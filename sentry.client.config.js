// This file configures the initialization of Sentry on the client side
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  // Adjust this value in production
  tracesSampleRate: 0.1,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
  
  // Disable the default integrations until we explicitly want to use them
  defaultIntegrations: false,
});