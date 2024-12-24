'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

type ErrorProps = {
  error: Error & {
    digest?: string;
    message: string;
  };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">We've been notified and are working to fix the issue.</p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-left bg-gray-100 p-4 rounded-md overflow-auto max-w-full">
          {error.message}
        </pre>
      )}
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
