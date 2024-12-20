import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Enable tracing for a small percentage of sessions
  tracesSampleRate: 0.1,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
  
  // Enable console integration for easier debugging
  integrations: [
    new Sentry.Integrations.GlobalHandlers({
      onerror: true,
      onunhandledrejection: true,
    }),
    new Sentry.Integrations.Breadcrumbs({
      console: true,
      dom: true,
      fetch: true,
      history: true,
    }),
  ],

  // Don't send errors in development
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});