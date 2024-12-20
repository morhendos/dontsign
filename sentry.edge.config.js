import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,

  integrations: [
    new Sentry.BrowserTracing(),
  ],

  // Ignore certain known errors
  ignoreErrors: [
    'lockdown',
    'null'
  ],

  // Performance monitoring
  tracesSampleRate: 0.1,
  
  // Edge-specific options
  enableTracing: true,
  reportAllChanges: false
});
