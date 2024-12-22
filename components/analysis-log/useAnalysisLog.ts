import { useState, useCallback, useRef } from 'react';
import type { LogEntry } from './AnalysisLog';

export interface AnalysisLogState {
  entries: LogEntry[];
  addEntry: (message: string, status?: LogEntry['status']) => void;
  updateLastEntry: (status: LogEntry['status']) => void;
  clearEntries: () => void;
}

/**
 * Hook to manage analysis log entries with guaranteed unique IDs
 */
export const useAnalysisLog = (): AnalysisLogState => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const idCounter = useRef(0);

  // Generate a guaranteed unique ID by combining timestamp and counter
  const generateUniqueId = () => {
    idCounter.current += 1;
    return `${Date.now()}-${idCounter.current}`;
  };

  const addEntry = useCallback((message: string, status: LogEntry['status'] = 'active') => {
    const entry: LogEntry = {
      id: generateUniqueId(),
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
    // Reset the counter when clearing entries
    idCounter.current = 0;
  }, []);

  return {
    entries,
    addEntry,
    updateLastEntry,
    clearEntries
  };
};