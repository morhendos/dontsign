import { useState, useCallback, useRef } from 'react';
import { LogEntry, LogStatus } from './types';

export function useAnalysisLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idCounter = useRef(0);

  const addLog = useCallback((message: string, status: LogStatus = 'info') => {
    const newLog: LogEntry = {
      id: `log-${idCounter.current++}`,
      message,
      status,
      timestamp: Date.now()
    };

    setLogs(prevLogs => [...prevLogs, newLog]);
    return newLog.id;
  }, []);

  const updateLog = useCallback((id: string, updates: Partial<Omit<LogEntry, 'id'>>) => {
    setLogs(prevLogs =>
      prevLogs.map(log =>
        log.id === id
          ? { ...log, ...updates }
          : log
      )
    );
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    idCounter.current = 0;
  }, []);

  return {
    logs,
    addLog,
    updateLog,
    clearLogs
  };
}