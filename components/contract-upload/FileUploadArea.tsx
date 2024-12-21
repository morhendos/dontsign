'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFProcessingError } from '@/lib/errors';
import { trackUploadStart, trackUploadError } from '@/lib/analytics-events';
import { LoadingSpinner } from '../ui/loading-spinner';
import type { ErrorDisplay } from '@/types/analysis';

interface FileUploadAreaProps {
  file: File | null;
  error: ErrorDisplay | null;
  onFileSelect: (file: File | null) => void;
  isUploading: boolean;
  processingStatus?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadArea({
  file,
  error,
  onFileSelect,
  isUploading,
  processingStatus
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.size > MAX_FILE_SIZE) {
      throw new PDFProcessingError(
        'File too large. Please upload a file smaller than 10MB.',
        'INVALID_FORMAT'
      );
    }

    trackUploadStart(file.type);
    onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full max-w-3xl mx-auto p-8 mt-8
        border-2 border-dashed rounded-lg
        transition-colors duration-200
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 dark:border-gray-700'}
        ${error ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' : ''}
        ${file ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950' : ''}
      `}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner />
            {processingStatus && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {processingStatus}
              </p>
            )}
          </div>
        ) : file ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selected file: {file.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Click or drop another file to replace
            </p>
          </>
        ) : (
          <>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Drop your contract here or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports PDF and DOCX files up to 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}