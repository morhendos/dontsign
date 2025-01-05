import { useState, useCallback } from 'react';
import { validateFile } from '../../utils/text-processing';
import type { FileHandlerOptions } from '../../types';

export const useFileUpload = (options: FileHandlerOptions = {}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{ message: string; type: string } | null>(null);

  const handleFileSelect = useCallback(async (newFile: File | null) => {
    setError(null);
    
    if (!newFile) {
      setFile(null);
      return;
    }

    setIsProcessing(true);
    options.onStatusUpdate?.('Validating file...');

    try {
      if (!validateFile(newFile)) {
        throw new Error('Invalid file type. Please upload a PDF or DOCX file.');
      }

      setFile(newFile);
      options.onStatusUpdate?.('File ready for analysis');
      options.onEntryComplete?.();
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Error processing file',
        type: 'error'
      });
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const resetFile = useCallback(() => {
    setFile(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    file,
    error,
    isProcessing,
    handleFileSelect,
    resetFile
  };
};