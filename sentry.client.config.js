import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
    
    // Enhanced error ignoring
    ignoreErrors: [
      // Ignore lockdown-related errors
      'lockdown',
      'null',
      /lockdown-.*/,  // Regex to catch all lockdown-related errors
      'Cannot set property .* of null',
      'Cannot read property .* of null'
    ],
    
    beforeSend(event) {
      // Filter out events from lockdown.js
      if (event.exception?.values?.some(ex => 
        ex.filename?.includes('lockdown') || 
        ex.value === 'null' ||
        ex.type?.includes('lockdown')
      )) {
        return null;
      }
      return event;
    },

    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', /^https:\/\/.+/],
      }),
      // Explicitly disable console breadcrumbs
      new Sentry.Integrations.Breadcrumbs({
        console: false  // Disable all console logging
      })
    ],

    beforeBreadcrumb(breadcrumb) {
      // More aggressive filtering of breadcrumbs
      if (
        breadcrumb.category === 'console' && 
        (breadcrumb.message === 'null' || 
         String(breadcrumb.message).includes('lockdown') ||
         breadcrumb.data?.logger?.includes('lockdown'))
      ) {
        return null;
      }
      return breadcrumb;
    },

    // Add additional initialization options
    initialScope: {
      tags: {
        'lockdown.handled': 'true'
      }
    }
  });
}
