import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
  
  // Enable node specific integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],

  // Don't send errors in development
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});