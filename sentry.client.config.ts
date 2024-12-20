import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // Adjust this value between 0 and 1 based on your needs
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Disable Console Integration to prevent null logs
  integrations: [
    new Sentry.Integrations.Breadcrumbs({
      console: false // This will disable console logging
    })
  ],
  
  // Environment
  environment: process.env.NODE_ENV,
});