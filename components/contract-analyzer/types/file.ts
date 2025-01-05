export interface FileHandlerOptions {
  onStatusUpdate?: (status: string) => void;
  onEntryComplete?: () => void;
}

export interface FileProcessingResult {
  text: string;
  type: string;
  name: string;
}
