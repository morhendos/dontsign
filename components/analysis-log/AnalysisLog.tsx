import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
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
}

const AnalysisLog: React.FC<AnalysisLogProps> = ({ entries, className }) => {
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
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardContent className="p-4">
        <ScrollArea className="h-40 w-full rounded-md">
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-start gap-3 p-2 rounded-lg transition-all duration-300',
                  'animate-in slide-in-from-bottom-2',
                  entry.status === 'error' && 'bg-red-50 dark:bg-red-950',
                  entry.status === 'active' && 'bg-blue-50 dark:bg-blue-950'
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
