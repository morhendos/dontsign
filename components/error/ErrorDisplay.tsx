import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clock, Ban, AlertTriangle, ServerCrash } from 'lucide-react';
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

  // Customize based on error type
  switch (error?.code) {
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
      description = error.clientMessage || 'Our AI service is currently unavailable. Please try again later.';
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
  }

  const Icon = icon;

  return (
    <Alert 
      variant={variant}
      className={cn(
        "mt-4",
        variant === 'default' && "border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-900 dark:border-yellow-900/50 dark:bg-yellow-900/10 dark:text-yellow-100 dark:[&>svg]:text-yellow-100",
        variant === 'destructive' && "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-900 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-100 dark:[&>svg]:text-red-100"
      )}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle className={cn(
        variant === 'default' && "text-yellow-900 dark:text-yellow-100",
        variant === 'destructive' && "text-red-900 dark:text-red-100"
      )}>{title}</AlertTitle>
      <AlertDescription className={cn(
        variant === 'default' && "text-yellow-800/90 dark:text-yellow-100/90",
        variant === 'destructive' && "text-red-800/90 dark:text-red-100/90"
      )}>{description}</AlertDescription>
    </Alert>
  );
}
