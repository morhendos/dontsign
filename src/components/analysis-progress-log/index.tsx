import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

export interface LogEntry {
  id: string;
  message: string;
  status: 'pending' | 'complete' | 'active';
  timestamp: Date;
}

interface AnalysisProgressLogProps {
  logs: LogEntry[];
  className?: string;
}

const AnalysisProgressLog = ({ logs, className = '' }: AnalysisProgressLogProps) => {
  // Function to render the appropriate status icon
  const renderStatusIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardContent className="p-4">
        <ScrollArea className="h-48 w-full rounded-md">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-2 rounded-lg transition-all duration-300 animate-fadeIn"
                style={{
                  opacity: log.status === 'pending' ? 0.7 : 1,
                  transform: `translateY(0)`,
                }}
              >
                <div className="flex-shrink-0 mt-1">
                  {renderStatusIcon(log.status)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-gray-700 leading-tight">
                    {log.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {log.timestamp.toLocaleTimeString()}
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

export default AnalysisProgressLog;