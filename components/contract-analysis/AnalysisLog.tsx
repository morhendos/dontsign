'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import type { AnalysisStage } from '../hero/hooks/useContractAnalysis';

interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface AnalysisLogProps {
  isAnalyzing: boolean;
  stage: AnalysisStage;
  progress: number;
  processingStatus: string;
  currentChunk?: number;
  totalChunks?: number;
}

export function AnalysisLog({ 
  isAnalyzing,
  stage,
  progress,
  processingStatus,
  currentChunk,
  totalChunks 
}: AnalysisLogProps) {
  const logRef = useRef<Array<LogEntry>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Add a log entry
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const entry = {
      timestamp: new Date(),
      message,
      type
    };
    logRef.current = [...logRef.current, entry];
  };

  // Log stage changes
  useEffect(() => {
    if (!isAnalyzing) return;

    switch(stage) {
      case 'preprocessing':
        addLog('🔄 Preprocessing document...');
        break;
      case 'analyzing':
        if (currentChunk && totalChunks) {
          addLog(`📊 Analyzing section ${currentChunk} of ${totalChunks}`);
        } else {
          addLog('📊 Starting analysis...');
        }
        break;
      case 'complete':
        addLog('✅ Analysis complete!', 'success');
        break;
    }
  }, [stage, currentChunk, totalChunks, isAnalyzing]);

  // Log processing status changes
  useEffect(() => {
    if (processingStatus) {
      addLog(`ℹ️ ${processingStatus}`);
    }
  }, [processingStatus]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logRef.current.length]);

  if (!isAnalyzing) return null;

  return (
    <Card className="mt-4 p-4 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-sm font-semibold mb-2">Analysis Progress</h3>
      <ScrollArea className="h-32" ref={scrollRef}>
        <div className="space-y-1">
          {logRef.current.map((entry, index) => (
            <div 
              key={index} 
              className={`text-sm ${entry.type === 'error' ? 'text-red-600 dark:text-red-400' : 
                entry.type === 'success' ? 'text-green-600 dark:text-green-400' : 
                entry.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-slate-600 dark:text-slate-400'}`}
            >
              <span className="text-xs text-slate-500">
                {entry.timestamp.toLocaleTimeString()} 
              </span>
              {' '}{entry.message}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  );
}
