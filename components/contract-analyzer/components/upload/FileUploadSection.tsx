import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisButton } from './AnalysisButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FileUploadSectionProps {
  file: File | null;
  error: any;
  onFileSelect: (file: File | null) => void;
  isUploading: boolean;
  processingStatus: string;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isAnalyzed?: boolean;
}

export const FileUploadSection = ({
  file,
  error,
  onFileSelect,
  isUploading,
  processingStatus,
  onAnalyze,
  isAnalyzing,
  isAnalyzed = false
}: FileUploadSectionProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => onFileSelect(files[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading || isAnalyzing
  });

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'w-full max-w-3xl mx-auto p-8',
          'border-2 border-dashed rounded-lg',
          'transition-all duration-200 ease-in-out',
          'cursor-pointer group relative',
          isDragActive && 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30 scale-102',
          !isDragActive && !error && !file && 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20',
          error && 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
          file && !error && 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
          (isUploading || isAnalyzing) && 'opacity-75 cursor-wait'
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
                  isDragActive
                    ? 'text-blue-500 dark:text-blue-400 scale-110'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-110'
                )}
              />
              <p
                className={cn(
                  'text-base font-medium',
                  'transition-colors duration-200',
                  isDragActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                )}
              >
                Drop your contract here or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports PDF and DOCX files
              </p>
            </>
          )}
        </div>
      </div>

      {/* Analysis Button */}
      <div className="flex justify-center">
        <AnalysisButton 
          isDisabled={!file || isAnalyzing || isUploading}
          isAnalyzing={isAnalyzing}
          isAnalyzed={isAnalyzed}
          onClick={onAnalyze}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm text-center">
          {error.message}
        </div>
      )}
    </div>
  );
};