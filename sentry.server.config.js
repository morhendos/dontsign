// This file configures the initialization of Sentry on the server side
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Adjust this value in production
  tracesSampleRate: 0.1,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Disable the default integrations
  defaultIntegrations: false,
});