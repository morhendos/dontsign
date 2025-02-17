'use client';

import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Camera, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisButton } from './AnalysisButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useState } from 'react';

interface FileUploadSectionProps {
  file: File | null;
  error: any;
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  processingStatus: string;
  onAnalyze?: () => void;
  isAnalyzing: boolean;
  isAnalyzed?: boolean;
  hasAcceptedDisclaimer: boolean;
}

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
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window);
    };
    checkMobile();
  }, []);

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    onDrop: files => {
      if (isMobile && navigator.vibrate) {
        navigator.vibrate(50);
      }
      onFileSelect(files[0]);
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading || isAnalyzing
  });

  useEffect(() => {
    if (isUploading) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isUploading]);

  const showUploadPrompt = !file && !isUploading;
  const showFileInfo = file && !isUploading;
  const showAnalyzeButton = (file || isAnalyzed) && !isUploading;

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onFileSelect(file);
    };
    input.click();
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-0">
      {/* Progress Steps */}
      <div className="flex justify-center items-center space-x-3 md:space-x-4 mb-4 md:mb-8">
        <div className={cn(
          'flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300',
          file ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
        )}>
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center bg-white dark:bg-gray-800">
            1
          </div>
          <span className="text-xs md:text-sm font-medium">Upload</span>
        </div>
        <div className={cn(
          'flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all duration-300',
          isAnalyzing ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
        )}>
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center bg-white dark:bg-gray-800">
            2
          </div>
          <span className="text-xs md:text-sm font-medium">Analyze</span>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'w-full max-w-3xl mx-auto p-4 md:p-8',
          'backdrop-blur-sm',
          'border-2 border-dashed rounded-xl',
          'transition-all duration-300 ease-out',
          'cursor-pointer group relative',
          isDragActive && 'border-blue-500 bg-blue-50/80 dark:border-blue-400 dark:bg-blue-950/30 scale-102 shadow-lg',
          !isDragActive && !error && !file && 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20',
          error && 'border-red-300 bg-red-50/80 dark:border-red-800 dark:bg-red-950/30',
          file && !error && 'border-green-300 bg-green-50/80 dark:border-green-800 dark:bg-green-950/30',
          (isUploading || isAnalyzing) && 'opacity-75 cursor-wait'
        )}
      >
        <input {...getInputProps()} />

        {/* Drag Overlay */}
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 dark:bg-blue-400/10 rounded-xl">
            <div className="transform -rotate-12 transition-transform group-hover:rotate-0">
              <Upload className="w-12 h-12 md:w-16 md:h-16 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 text-blue-500">
                <LoadingSpinner />
              </div>
              <div className="w-36 md:w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {processingStatus && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {processingStatus}
                </p>
              )}
            </div>
          ) : showUploadPrompt ? (
            <>
              <div className="flex flex-col items-center">
                <Upload
                  className={cn(
                    'w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4',
                    'transition-all duration-300',
                    isDragActive
                      ? 'text-blue-500 dark:text-blue-400 scale-110 -rotate-12'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110'
                  )}
                />
                {isMobile ? (
                  <>
                    <p className="text-base md:text-lg font-medium mb-2">
                      Upload your contract
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCameraClick}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Supports PDF and DOCX files
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base md:text-lg font-medium mb-2">
                      Drop your contract here or click to select
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Supports PDF and DOCX files
                    </p>
                  </>
                )}
              </div>
            </>
          ) : showFileInfo ? (
            <>
              <div 
                className={cn(
                  'flex items-center space-x-3 p-3 md:p-4 rounded-lg transition-all duration-300 w-full max-w-xs md:max-w-sm',
                  'bg-green-100/50 dark:bg-green-900/30'
                )}
              >
                <File className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                {file && (
                  <div className="text-left min-w-0">
                    <p className="font-medium text-green-800 dark:text-green-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs md:text-sm text-green-600 dark:text-green-300">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                Click or drop another file to replace
              </p>
            </>
          ) : null}
        </div>
      </div>

      {/* Analysis Button */}
      {showAnalyzeButton && (
        <div className="flex justify-center px-4 sm:px-0">
          <AnalysisButton 
            onClick={onAnalyze}
            isAnalyzing={isAnalyzing}
            isAnalyzed={isAnalyzed}
            hasAcceptedDisclaimer={hasAcceptedDisclaimer}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="
          flex items-center justify-center
          p-3 md:p-4 mx-4 sm:mx-0 rounded-lg
          bg-red-100 dark:bg-red-900/30
          text-red-800 dark:text-red-200
          text-xs md:text-sm text-center
          animate-slideIn
        ">
          <div className="max-w-md">{error.message}</div>
        </div>
      )}
    </div>
  );
};
