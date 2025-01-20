import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ErrorCode } from '@/lib/errors';

interface ErrorAlertProps {
  error: {
    message: string;
    type: ErrorCode;
  };
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  let title = 'Error';
  let description = error.message;

  switch (error.type) {
    case 'INVALID_INPUT':
      title = 'Invalid Document';
      break;
    case 'INVALID_DOCUMENT_TYPE':
      title = 'Unsupported Document Type';
      break;
    case 'API_ERROR':
      title = 'Analysis Failed';
      break;
    case 'TEXT_PROCESSING_ERROR':
      title = 'Processing Error';
      break;
    case 'CONFIGURATION_ERROR':
      title = 'Configuration Error';
      break;
    case 'UNKNOWN_ERROR':
      title = 'Unexpected Error';
      break;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
