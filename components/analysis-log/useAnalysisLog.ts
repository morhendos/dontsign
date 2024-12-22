import { useState, useCallback } from 'react';
import type { LogEntry } from './AnalysisLog';

export interface AnalysisLogState {
  entries: LogEntry[];
  addEntry: (message: string, status?: LogEntry['status']) => void;
  updateLastEntry: (status: LogEntry['status']) => void;
  clearEntries: () => void;
}

/**
 * Hook to manage analysis log entries
 */
export const useAnalysisLog = (): AnalysisLogState => {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const addEntry = useCallback((message: string, status: LogEntry['status'] = 'active') => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      message,
      status,
      timestamp: new Date()
    };

    setEntries(current => {
      // If there's an active entry, mark it as complete
      const updated = current.map(e => 
        e.status === 'active' ? { ...e, status: 'complete' as const } : e
      );
      return [...updated, entry];
    });
  }, []);

  const updateLastEntry = useCallback((status: LogEntry['status']) => {
    setEntries(current => {
      if (current.length === 0) return current;
      
      return current.map((entry, index) => 
        index === current.length - 1 ? { ...entry, status: status as LogEntry['status'] } : entry
      );
    });
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    addEntry,
    updateLastEntry,
    clearEntries
  };
};