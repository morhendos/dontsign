import * as Sentry from '@sentry/nextjs';
import { trackAnalysisStart, trackAnalysisComplete, trackError } from '@/lib/analytics-events';

export const startAnalyticsTransaction = (name: string) => {
  const transaction = Sentry.startTransaction({
    name,
    op: 'analyze'
  });
  
  Sentry.configureScope(scope => {
    scope.setSpan(transaction);
  });

  return transaction;
};

export const trackAnalysis = {
  start: (fileType: string) => trackAnalysisStart(fileType),
  complete: (fileType: string, duration: number) => trackAnalysisComplete(fileType, duration),
  error: (code: string, message: string) => trackError(code, message)
};

export const captureError = (error: unknown, context: Record<string, any>) => {
  console.error('[ContractAnalyzer] Error:', error);
  Sentry.captureException(error, { extra: context });
};
