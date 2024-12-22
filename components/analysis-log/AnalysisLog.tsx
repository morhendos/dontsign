import React, { useEffect, useRef } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { LogEntry, LogStatus } from './types';

interface AnalysisLogProps {
  logs: LogEntry[];
  className?: string;
}

const statusIcons: Record<LogStatus, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  loading: <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
};

const AnalysisLog: React.FC<AnalysisLogProps> = ({ logs, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
        opacity-90 hover:opacity-100 transition-opacity duration-200 ${className}`}
      ref={containerRef}
    >
      <div className="max-h-96 overflow-y-auto p-4 space-y-2">
        {logs.map((log, index) => (
          <div
            key={log.id}
            ref={index === logs.length - 1 ? lastLogRef : null}
            className="flex items-start space-x-2 text-sm animate-fadeIn"
          >
            <div className="flex-shrink-0 pt-1">{statusIcons[log.status]}</div>
            <div className="flex-1 break-words">{log.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisLog;