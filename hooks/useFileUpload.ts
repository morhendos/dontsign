import { useState, useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ErrorDisplay } from '@/types/analysis';
import { trackError, trackFileUpload, trackUserInteraction } from '@/lib/analytics-events';

export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<ErrorDisplay | null>(null);

  const handleFileSelection = useCallback((selectedFile?: File) => {
    if (!selectedFile) {
      const error = {
        message: 'Please select a file to analyze.',
        type: 'warning' as const,
      };
      setError(error);
      Sentry.addBreadcrumb({
        category: 'file',
        message: 'File selection failed - no file selected',
        level: 'warning',
      });
      trackError('NO_FILE', 'File selection failed - no file selected');
      return;
    }

    Sentry.addBreadcrumb({
      category: 'file',
      message: 'File selected',
      level: 'info',
      data: {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      },
    });

    // Track successful file upload
    trackFileUpload(selectedFile.type, selectedFile.size);

    if (
      selectedFile.type !== 'application/pdf' &&
      selectedFile.type !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const error = {
        message: 'Please upload a PDF or DOCX file.',
        type: 'error' as const,
      };
      setError(error);
      Sentry.captureMessage('Invalid file type selected', {
        level: 'warning',
        extra: {
          fileType: selectedFile.type,
          fileName: selectedFile.name,
        },
      });
      trackError(
        'INVALID_FILE_TYPE',
        `Invalid file type: ${selectedFile.type}`
      );
      return;
    }

    setFile(selectedFile);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    trackUserInteraction('file_drop');
    handleFileSelection(droppedFile);
  }, [handleFileSelection]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    trackUserInteraction('file_select');
    handleFileSelection(selectedFile);
  }, [handleFileSelection]);

  const resetFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return {
    file,
    error,
    handleDrop,
    handleFileChange,
    handleFileSelection,
    resetFile,
  };
};
