import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  onError?: (error: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileAccepted, onError }) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
    onDropAccepted: (files) => onFileAccepted(files[0]),
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0]?.message || 'Invalid file type. Please upload a PDF or DOCX file.';
      onError?.(error);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-all duration-200 ease-in-out',
        'min-h-[200px] p-6',
        isDragActive && !isDragReject && 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2',
        isDragReject && 'border-destructive bg-destructive/5',
        !isDragActive && !isDragReject && 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div
          className={cn(
            'rounded-full p-4 transition-colors duration-200',
            isDragActive && !isDragReject && 'bg-primary/10',
            !isDragActive && 'bg-muted'
          )}
        >
          <Upload
            className={cn(
              'h-8 w-8 transition-colors duration-200',
              isDragActive && !isDragReject && 'text-primary',
              isDragReject && 'text-destructive',
              !isDragActive && !isDragReject && 'text-muted-foreground'
            )}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isDragActive
              ? isDragReject
                ? 'This file type is not supported'
                : 'Drop your file here'
              : 'Drag & drop your contract here'}
          </p>
          <p className="text-xs text-muted-foreground">Supports PDF and DOCX files</p>
        </div>
      </div>
    </div>
  );
}