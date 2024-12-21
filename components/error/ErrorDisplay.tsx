import { AlertTriangle, Clock } from 'lucide-react';
import type { ErrorDisplay as ErrorDisplayType } from '@/types/analysis';

interface ErrorDisplayProps {
  error: ErrorDisplayType;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className={`mt-4 p-4 rounded-lg text-center flex items-center justify-center gap-2
      ${error.type === 'error' ? 'bg-red-50 border border-red-200 text-red-600' : 
                               'bg-yellow-50 border border-yellow-200 text-yellow-600'}`}>
      {error.type === 'error' ? 
        <AlertTriangle className="w-5 h-5" /> : 
        <Clock className="w-5 h-5" />}
      {error.message}
    </div>
  );
}