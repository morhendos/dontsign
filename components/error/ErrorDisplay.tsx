import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clock, Ban, AlertTriangle, ServerCrash, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: any;
}

type AlertVariant = 'default' | 'destructive';

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  // Default error state
  let title = 'Error';
  let description = 'An unexpected error occurred. Please try again.';
  let icon = AlertCircle;
  let variant: AlertVariant = 'destructive';
  let showSupportedTypes = false;

  // Customize based on error type
  switch (error?.code) {
    case 'INVALID_DOCUMENT_TYPE':
      title = 'Cannot Analyze Document';
      description = error.message || 'This document type is not supported for analysis.';
      icon = FileX;
      variant = 'destructive';
      showSupportedTypes = true;
      break;

    case 'CIRCUIT_BREAKER_OPEN':
      title = 'Service Temporarily Unavailable';
      description = error.clientMessage || 'Service is recovering. Please try again later.';
      icon = Clock;
      variant = 'default';
      break;

    case 'RATE_LIMIT_EXCEEDED':
      title = 'Too Many Requests';
      description = error.clientMessage || 'Please wait a moment before trying again.';
      icon = Ban;
      variant = 'default';
      break;

    case 'AI_SERVICE_ERROR':
      title = 'AI Service Error';
      description = error.clientMessage || 'Unable to complete the analysis. Please try again later.';
      icon = ServerCrash;
      variant = 'destructive';
      break;

    case 'ANALYSIS_TIMEOUT':
      title = 'Analysis Timeout';
      description = error.clientMessage || 'The analysis took too long. Please try with a shorter document.';
      icon = Clock;
      variant = 'default';
      break;

    case 'INVALID_INPUT':
      title = 'Invalid Input';
      description = error.message || 'Please check your input and try again.';
      icon = AlertTriangle;
      variant = 'default';
      break;

    case 'TEXT_PROCESSING_ERROR':
      title = 'Processing Error';
      description = error.message || 'Unable to process the document. Please try again.';
      icon = AlertTriangle;
      variant = 'default';
      break;

    case 'API_ERROR':
      title = 'API Error';
      description = error.message || 'Unable to complete the request. Please try again.';
      icon = ServerCrash;
      variant = 'destructive';
      break;
  }

  const Icon = icon;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Alert 
        variant={variant}
        className={cn(
          "border-2",
          variant === 'default' && "border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-900 dark:border-yellow-900/50 dark:bg-yellow-900/10 dark:text-yellow-100 dark:[&>svg]:text-yellow-100",
          variant === 'destructive' && "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-900 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-100 dark:[&>svg]:text-red-100"
        )}
      >
        <Icon className="h-5 w-5" />
        <AlertTitle className={cn(
          "text-lg font-semibold mb-2",
          variant === 'default' && "text-yellow-900 dark:text-yellow-100",
          variant === 'destructive' && "text-red-900 dark:text-red-100"
        )}>{title}</AlertTitle>
        <AlertDescription className={cn(
          "text-base",
          variant === 'default' && "text-yellow-800/90 dark:text-yellow-100/90",
          variant === 'destructive' && "text-red-800/90 dark:text-red-100/90"
        )}>{description}</AlertDescription>
      </Alert>

      {showSupportedTypes && (
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-center mb-4">
            This tool analyzes legal documents such as contracts, NDAs, terms of service, and other legal agreements.
          </h3>
        </div>
      )}
    </div>
  );
}
