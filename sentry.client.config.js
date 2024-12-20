import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    ignoreErrors: [
      // Ignore lockdown-related errors
      'lockdown',
      'null'
    ],
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
    
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', /^https:\/\/.+/],
      }),
    ],

    beforeBreadcrumb(breadcrumb) {
      // Ignore console logs from lockdown
      if (breadcrumb.category === 'console' && breadcrumb.message === 'null') {
        return null;
      }
      return breadcrumb;
    },
  });
}