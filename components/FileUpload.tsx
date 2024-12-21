"use client";

import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { ErrorDisplay } from '@/types/analysis';

interface FileUploadProps {
  file: File | null;
  error: ErrorDisplay | null;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
}

export const FileUpload = ({
  file,
  error,
  onDrop,
  onFileChange,
  onClick,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`p-8 border-2 border-dashed rounded-lg bg-white cursor-pointer transition-colors hover:bg-gray-50
        ${error?.type === 'error' ? 'border-red-300' : 'border-gray-300'}`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-center gap-4">
        <FileText
          className={`w-8 h-8 ${
            error?.type === 'error' ? 'text-red-500' : 'text-blue-500'
          }`}
        />
        <p className="text-lg text-gray-600">
          {file ? file.name : 'Click or drop your contract here (PDF, DOCX)'}
        </p>
      </div>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={onFileChange}
        className="hidden"
        id="file-upload"
        ref={fileInputRef}
      />
    </div>
  );
};
