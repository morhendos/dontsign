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
        return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'active':
        return <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
      case 'error':
        return <Circle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-gray-300" />;
    }
  };

  if (entries.length === 0) return null;

  return (
    <div className="fixed right-4 top-24 z-50">
      <Card 
        className={cn(
          'w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm',
          'shadow-lg border-gray-200 dark:border-gray-800',
          'transition-all duration-300 ease-in-out',
          className
        )}
      >
        <CardContent className="p-0 relative">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Analysis Progress
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Log entries */}
          <div className="relative">
            <ScrollArea className="h-[28vh] overflow-hidden">
              <div className="py-1 px-2 space-y-1" ref={scrollRef}>
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    ref={index === entries.length - 1 ? lastEntryRef : null}
                    className={cn(
                      'flex items-start gap-2 px-2 py-1.5 rounded-md transition-all duration-300',
                      'animate-in slide-in-from-right-5',
                      entry.status === 'error' && 'bg-red-50 dark:bg-red-950/50',
                      entry.status === 'active' && 'bg-blue-50 dark:bg-blue-950/50'
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {renderIcon(entry.status)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-gray-700 dark:text-gray-200 leading-tight">
                        {entry.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisLog;
