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
      'null',
      /lockdown-.*/,
      // Common security-related noise
      'SecurityError',
      'CORS error',
      // OpenAI specific
      'Failed to fetch',
      'NetworkError',
    ],
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
    
    beforeSend(event) {
      // Filter out lockdown and security events
      if (event.message?.includes('lockdown') || 
          event.message === 'null' ||
          event?.exception?.values?.some(ex => 
            ex.value === 'null' || 
            ex.value?.includes('lockdown')
          )
      ) {
        return null;
      }
      return event;
    },
    
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', /^https:\/\/.+/],
      }),
      // Explicitly configure console integration
      new Sentry.Integrations.Breadcrumbs({
        console: {
          levels: ['error', 'warn'] // Only capture error and warning logs
        }
      })
    ],

    beforeBreadcrumb(breadcrumb) {
      // More aggressive filtering of breadcrumbs
      if (
        breadcrumb.category === 'console' && 
        (
          breadcrumb.message === 'null' || 
          String(breadcrumb.message).includes('lockdown') ||
          breadcrumb.data?.logger?.includes('lockdown')
        )
      ) {
        return null;
      }
      return breadcrumb;
    },
  });
}
