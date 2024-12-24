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
  isVisible?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
}

const AnalysisLog: React.FC<AnalysisLogProps> = ({ 
  entries, 
  className, 
  onClose,
  isVisible = true,
  onVisibilityChange
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastEntryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse enter/leave
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => onVisibilityChange?.(true);
    const handleMouseLeave = () => onVisibilityChange?.(false);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [onVisibilityChange]);

  // Listen for custom toggle event
  useEffect(() => {
    const handleToggle = () => {
      onVisibilityChange?.(!isVisible);
    };

    window.addEventListener('toggleLog', handleToggle);
    return () => window.removeEventListener('toggleLog', handleToggle);
  }, [isVisible, onVisibilityChange]);

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
    <div 
      ref={containerRef}
      className={cn(
        'fixed right-4 top-28 z-50', // Adjusted top position and z-index
        'transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      )}
      style={{ 
        marginTop: '1rem' // Added extra margin from header
      }}
    >
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
            <ScrollArea className="max-h-[20vh] overflow-y-auto">
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