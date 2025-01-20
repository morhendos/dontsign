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
    case 'RATE_LIMIT':
      title = 'Too Many Requests';
      description = 'Please wait a moment before trying again.';
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
