import { useState, useCallback } from 'react';
import type { LogEntry, LogStatus } from '@/types/log';

export const useAnalysisLog = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const generateId = () => `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const addEntry = useCallback((message: string) => {
    setEntries(prev => [
      ...prev,
      {
        id: generateId(),
        message,
        status: 'active' as LogStatus,
        timestamp: Date.now()
      }
    ]);
  }, []);

  const updateLastEntry = useCallback((status: LogStatus) => {
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