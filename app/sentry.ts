import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initializeSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not found. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // Environment will be set based on NEXT_PUBLIC_VERCEL_ENV or NODE_ENV
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    // This sets the sample rate to be 10%. You may want to change this in production
    sampleRate: 0.1,
    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',
    // Capture unhandled promise rejections
    integrations: [
      new Sentry.BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: ['localhost', process.env.NEXT_PUBLIC_VERCEL_URL || '', /^\//],
      }),
      new Sentry.Replay({
        // Capture 10% of all sessions
        sessionSampleRate: 0.1,
        // Capture 100% of sessions with an error
        errorSampleRate: 1.0,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function captureException(error: unknown, context?: Record<string, any>) {
  // Add additional context to all errors
  const errorContext = {
    ...context,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra: errorContext,
    });
  } else {
    Sentry.captureMessage('Non-Error exception captured', {
      extra: {
        error,
        ...errorContext,
      },
      level: 'error',
    });
  }
}