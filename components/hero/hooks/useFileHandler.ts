import { useState } from 'react';
import { readPdfText } from '@/lib/pdf-utils';
import type { ErrorDisplay } from '@/types/analysis';

interface UseFileHandlerProps {
  /** Callback function to handle status updates during file processing */
  onStatusUpdate?: (status: string, duration?: number) => void;
  /** Callback function called when an entry is complete */
  onEntryComplete?: () => void;
}

interface FileHandlerResult {
  /** Currently selected file */
  file: File | null;
  /** Error state for file handling */
  error: ErrorDisplay | null;
  /** Whether file is currently being processed */
  isProcessing: boolean;
  /** Function to handle file selection */
  handleFileSelect: (selectedFile: File | null) => Promise<void>;
  /** Function to reset file state */
  resetFile: () => void;
}

/**
 * A custom hook for handling file upload and processing functionality.
 */
export const useFileHandler = ({
  onStatusUpdate,
  onEntryComplete,
}: UseFileHandlerProps = {}): FileHandlerResult => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Validates file type and size
   */
  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      setError({
        message: 'Please upload a PDF or DOCX file.',
        type: 'error',
      });
      return false;
    }

    // 10MB limit
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError({
        message: 'File size must be less than 10MB.',
        type: 'error',
      });
      return false;
    }

    return true;
  };

  /**
   * Handles file selection and initial processing
   */
  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setError({
        message: 'Please select a valid PDF or DOCX file.',
        type: 'warning',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validate file
      if (!validateFile(selectedFile)) {
        return;
      }

      // For PDFs, verify we can extract text
      if (selectedFile.type === 'application/pdf') {
        await readPdfText(selectedFile);
      }

      // Update state
      setFile(selectedFile);
      setError(null);
      onStatusUpdate?.('File ready for analysis', 2000);
      
      onEntryComplete?.();
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      setError({
        message: 'Error processing file. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Resets file state
   */
  const resetFile = () => {
    setFile(null);
    setError(null);
    setIsProcessing(false);
  };

  return {
    file,
    error,
    isProcessing,
    handleFileSelect,
    resetFile,
  };
};
