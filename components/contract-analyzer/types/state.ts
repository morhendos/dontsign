export interface ProcessingState {
  isProcessing: boolean;
  isAnalyzing: boolean;
  progress: number;
  status: string;
}

export interface StatusMessage {
  text: string;
  type: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
}
