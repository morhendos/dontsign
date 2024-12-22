import { useState, useCallback } from 'react';
import { LogEntry } from '@/components/analysis-progress-log';

export const useAnalysisLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      message,
      status: 'active',
      timestamp: new Date(),
    };

    setLogs(currentLogs => {
      // Mark the previous active log as complete
      const updatedLogs = currentLogs.map(log => 
        log.status === 'active' ? { ...log, status: 'complete' } : log
      );
      return [...updatedLogs, newLog];
    });
  }, []);

  const completeCurrentPhase = useCallback(() => {
    setLogs(currentLogs => 
      currentLogs.map(log => 
        log.status === 'active' ? { ...log, status: 'complete' } : log
      )
    );
  }, []);

  const resetLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    addLog,
    completeCurrentPhase,
    resetLogs,
  };
};