'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFProcessingError } from '@/lib/errors';
import { trackUploadStart } from '@/lib/analytics-events';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  processingStatus,
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      if (!uploadedFile) {
        onFileSelect(null);
        return;
      }
      
      if (uploadedFile.size > MAX_FILE_SIZE) {
        throw new PDFProcessingError(
          'File too large. Please upload a file smaller than 10MB.',
          'FILE_TOO_LARGE'
        );
      }

      trackUploadStart(uploadedFile.type);
      onFileSelect(uploadedFile);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'w-full max-w-3xl mx-auto p-8 mt-8',
        'border-2 border-dashed rounded-lg',
        'transition-all duration-200 ease-in-out',
        'cursor-pointer group relative',
        isDragging && 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30 scale-102',
        !isDragging && !error && !file && 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20',
        error && 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
        file && !error && 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
        isUploading && 'opacity-75 cursor-wait'
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 text-blue-500">
              <LoadingSpinner />
            </div>
            {processingStatus && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {processingStatus}
              </p>
            )}
          </div>
        ) : file ? (
          <>
            <div className="flex items-center space-x-2 text-green-800 dark:text-green-100 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
              <FileText className="w-8 h-8" />
              <span className="text-lg font-medium">{file.name}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
              Click or drop another file to replace
            </p>
          </>
        ) : (
          <>
            <Upload
              className={cn(
                'w-12 h-12 mb-2',
                'transition-all duration-200',
                isDragging
                  ? 'text-blue-500 dark:text-blue-400 scale-110'
                  : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110'
              )}
            />
            <p
              className={cn(
                'text-base font-medium',
                'transition-colors duration-200',
                isDragging
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              )}
            >
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