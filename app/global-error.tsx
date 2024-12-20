'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
          <p className="text-gray-600 mb-4">We've been notified and are working to fix the issue.</p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-left bg-gray-100 p-4 rounded-md overflow-auto max-w-full">
              {error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
