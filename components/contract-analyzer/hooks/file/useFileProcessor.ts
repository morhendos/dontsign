import { useState, useCallback } from 'react';
import { processFile } from '../../utils/text-processing';
import type { FileProcessingResult } from '../../types';

export interface UseFileProcessorOptions {
  onProcessingStart?: () => void;
  onProcessingComplete?: () => void;
  onProcessingError?: (error: Error) => void;
}

export const useFileProcessor = (options: UseFileProcessorOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<FileProcessingResult | null>(null);

  const processFileContent = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    
    options.onProcessingStart?.();

    try {
      const processed = await processFile(file);
      setResult(processed);
      options.onProcessingComplete?.();
      return processed;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error processing file');
      setError(error);
      options.onProcessingError?.(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    isProcessing,
    error,
    result,
    processFileContent,
    reset
  };
};
