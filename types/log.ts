export type LogStatus = 'pending' | 'active' | 'complete' | 'error';

export interface LogEntry {
  id: string;
  message: string;
  status: LogStatus;
  timestamp: number;
}
