import { useState } from 'react';
import { readPdfText } from '@/lib/pdf-utils';
import type { ErrorDisplay } from '@/types/analysis';

interface UseFileHandlerProps {
  /** Callback function to handle status updates during file processing */
  onStatusUpdate?: (status: string, duration?: number) => void;
  /** Callback function called when an entry is complete */
  onEntryComplete?: () => void;
  /** Initial progress to start with */
  initialProgress?: number;
}

interface FileHandlerResult {
  /** Currently selected file */
  file: File | null;
  /** Error state for file handling */
  error: ErrorDisplay | null;
  /** Whether file is currently being processed */
  isProcessing: boolean;
  /** Current processing progress */
  progress: number;
  /** Function to handle file selection */
  handleFileSelect: (selectedFile: File | null) => Promise<void>;
  /** Function to reset file state */
  resetFile: () => void;
}

/**
 * A custom hook for handling file upload and processing functionality.
 * 
 * This hook manages:
 * - File selection and validation
 * - PDF/DOCX content extraction
 * - Error handling
 * - Processing status updates
 * - Progress tracking
 *
 * @param props - Configuration options for the hook
 * @returns Object containing file state and control functions
 */
export const useFileHandler = ({ 
  onStatusUpdate,
  onEntryComplete,
  initialProgress = 0
}: UseFileHandlerProps = {}): FileHandlerResult => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(initialProgress);

  /**
   * Validates file type and size
   */
  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(file.type)) {
      setError({
        message: 'Please upload a PDF or DOCX file.',
        type: 'error'
      });
      return false;
    }

    // 10MB limit
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError({
        message: 'File size must be less than 10MB.',
        type: 'error'
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
        type: 'warning'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    onStatusUpdate?.('Checking file format...', 2000);

    try {
      // Validate file
      if (!validateFile(selectedFile)) {
        setProgress(0);
        return;
      }

      setProgress(30);
      onStatusUpdate?.('File format verified...', 1500);

      // For PDFs, verify we can extract text
      if (selectedFile.type === 'application/pdf') {
        setProgress(50);
        onStatusUpdate?.('Parsing PDF content...', 2000);
        await readPdfText(selectedFile);
        setProgress(80);
        onStatusUpdate?.('PDF content extracted successfully', 1500);
      }
      
      // Update state
      setProgress(100);
      setFile(selectedFile);
      setError(null);
      onStatusUpdate?.('File ready for analysis!', 2000);
      // Mark the last entry as complete
      requestAnimationFrame(() => {
        onEntryComplete?.();
      });
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      setError({
        message: 'Error processing file. Please try again.',
        type: 'error'
      });
      setProgress(0);
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
    setProgress(0);
  };

  return {
    file,
    error,
    isProcessing,
    progress,
    handleFileSelect,
    resetFile
  };
};
