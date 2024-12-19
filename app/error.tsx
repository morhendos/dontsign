'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Something went wrong!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We've been notified about this issue and are working to fix it.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => reset()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Go to Homepage
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-100 rounded overflow-auto">
                <pre className="text-sm text-gray-800">
                  {error.message}
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}