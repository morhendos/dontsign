import { AlertTriangle, Clock } from 'lucide-react';
import { ErrorDisplay as ErrorDisplayType } from '@/types/analysis';

interface ErrorMessageProps {
  error: ErrorDisplayType;
  className?: string;
}

const ERROR_STYLES = {
  error: {
    background: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />
  },
  warning: {
    background: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
    icon: <Clock className="w-5 h-5" aria-hidden="true" />
  }
};

export const ErrorMessage = ({ error, className = '' }: ErrorMessageProps) => {
  const styles = ERROR_STYLES[error.type];

  return (
    <div
      className={`mt-4 p-4 rounded-lg text-center flex items-center justify-center gap-2
        ${styles.background} border ${styles.border} ${styles.text} ${className}`}
      role="alert"
      aria-live="polite"
    >
      {styles.icon}
      <span>{error.message}</span>
    </div>
  );
};

ErrorMessage.displayName = 'ErrorMessage';
