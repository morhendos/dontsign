import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LogEntry {
  id: string;
  message: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  timestamp: Date;
}

interface AnalysisLogProps {
  entries: LogEntry[];
  className?: string;
  onClose?: () => void;
}

const AnalysisLog: React.FC<AnalysisLogProps> = ({ entries, className, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastEntryRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest entry
  useEffect(() => {
    if (lastEntryRef.current) {
      lastEntryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries.length]);

  const renderIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'active':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <Circle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  if (entries.length === 0) return null;

  return (
    <Card 
      className={cn(
        'fixed right-4 bottom-4 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm',
        'shadow-lg border-gray-200 dark:border-gray-800',
        'transition-all duration-300 ease-in-out',
        'max-h-[calc(100vh-2rem)]',
        className
      )}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            Analysis Progress
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Log entries */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-3 space-y-2" ref={scrollRef}>
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                ref={index === entries.length - 1 ? lastEntryRef : null}
                className={cn(
                  'flex items-start gap-3 p-2 rounded-lg transition-all duration-300',
                  'animate-in slide-in-from-right-5',
                  entry.status === 'error' && 'bg-red-50 dark:bg-red-950/50',
                  entry.status === 'active' && 'bg-blue-50 dark:bg-blue-950/50'
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {renderIcon(entry.status)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-tight">
                    {entry.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {entry.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AnalysisLog;
