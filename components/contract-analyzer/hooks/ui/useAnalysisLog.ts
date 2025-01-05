import { useState, useCallback } from 'react';

export interface LogEntry {
  message: string;
  status: 'active' | 'complete' | 'error';
  timestamp: number;
}

export const useAnalysisLog = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const addEntry = useCallback((message: string) => {
    setEntries(prev => [
      ...prev,
      {
        message,
        status: 'active',
        timestamp: Date.now()
      }
    ]);
  }, []);

  const updateLastEntry = useCallback((status: LogEntry['status']) => {
    setEntries(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        status
      };
      return updated;
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