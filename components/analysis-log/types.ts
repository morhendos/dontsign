export type LogStatus = 'info' | 'success' | 'error' | 'warning' | 'loading';

export interface LogEntry {
  id: string;
  message: string;
  status: LogStatus;
  timestamp: number;
}