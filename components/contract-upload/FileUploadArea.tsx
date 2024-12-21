import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFProcessingError } from '@/lib/errors';
import { trackUploadStart, trackUploadError } from '@/lib/analytics-events';
import type { ErrorDisplay } from '@/types/analysis';

interface FileUploadAreaProps {
  file: File | null;
  error: ErrorDisplay | null;
  onFileSelect: (file: File | null) => void;
  isUploading?: boolean;
  processingStatus?: string;
}

export function FileUploadArea({ 
  file, 
  error, 
  onFileSelect, 
  isUploading = false,
  processingStatus
}: FileUploadAreaProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    trackUploadStart(file.type);

    try {
      // Basic validation
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new PDFProcessingError(
          'File too large. Please upload a file smaller than 10MB.',
          'FILE_TOO_LARGE'
        );
      }

      onFileSelect(file);
    } catch (error) {
      console.error('Error handling file drop:', error);
      trackUploadError(error instanceof Error ? error.message : 'Unknown error');
      onFileSelect(null);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`
          p-10 border-2 border-dashed rounded-lg text-center
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${error ? 'border-red-300' : ''}
          ${isUploading ? 'cursor-wait opacity-75' : 'cursor-pointer hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <div className="text-gray-500">
            <svg
              className="animate-spin h-6 w-6 mx-auto mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing file...
          </div>
        ) : file ? (
          <div className="text-gray-500">
            <svg
              className="h-6 w-6 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {file.name}
          </div>
        ) : (
          <div className="text-gray-500">
            <svg
              className="h-6 w-6 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3V8"
              />
            </svg>
            {isDragActive ? (
              'Drop your contract here ...'
            ) : (
              'Drag & drop your contract, or click to select'
            )}
            <p className="text-sm text-gray-400 mt-2">Supports PDF and DOCX files up to 10MB</p>
          </div>
        )}
      </div>

      {/* Processing status display */}
      {processingStatus && (
        <div className="text-sm text-gray-600 text-center animate-fade-in">
          <span className="inline-block mr-2">
            <svg 
              className="w-4 h-4 inline-block animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </span>
          {processingStatus}
        </div>
      )}
    </div>
  );
}