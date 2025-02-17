'use client';

import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Camera, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisButton } from './AnalysisButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useState } from 'react';

// ... rest of the imports and interfaces stay the same ...

export const FileUploadSection = ({
  file,
  error,
  onFileSelect,
  isUploading,
  processingStatus,
  onAnalyze,
  isAnalyzing,
  isAnalyzed = false,
  hasAcceptedDisclaimer
}: FileUploadSectionProps) => {
  // ... rest of the state and hooks stay the same ...

  return (
    <div className="space-y-6">
      {/* ... previous content stays the same until the file info section ... */}
      
      {showFileInfo && (
        <>
          <div 
            className={cn(
              'flex items-center space-x-3 p-4 rounded-lg transition-all duration-300',
              'bg-green-100/50 dark:bg-green-900/30'
            )}
          >
            <File className="w-8 h-8 text-green-600 dark:text-green-400" />
            {file && (
              <div className="text-left">
                <p className="font-medium text-green-800 dark:text-green-200">
                  {file.name}
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
            Click or drop another file to replace
          </p>
        </>
      )}

      {/* ... rest of the component stays the same ... */}
    </div>
  );
};
