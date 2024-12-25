import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clock, Ban, AlertTriangle, ServerCrash } from 'lucide-react';

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
        variant === 'default' && "border-yellow-200 bg-yellow-50 text-yellow-900",
        variant === 'destructive' && "border-red-200 bg-red-50 text-red-900"
      )}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
