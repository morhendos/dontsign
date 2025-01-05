import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';
import { AnalysisButton } from './AnalysisButton';

interface FileUploadSectionProps {
  file: File | null;
  error: any;
  onFileSelect: (file: File | null) => void;
  isUploading: boolean;
  processingStatus: string;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const FileUploadSection = ({
  file,
  error,
  onFileSelect,
  isUploading,
  processingStatus,
  onAnalyze,
  isAnalyzing
}: FileUploadSectionProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => onFileSelect(files[0]),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-700'}
          ${isUploading || isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <input {...getInputProps()} disabled={isUploading || isAnalyzing} />
          
          {file ? (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <File className="w-6 h-6" />
              <span>{file.name}</span>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-gray-600 dark:text-gray-300">
                Drag & drop your contract file here, or <Button variant="link" className="px-1">browse</Button>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports PDF and DOCX files
              </p>
            </>
          )}

          {processingStatus && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {processingStatus}
            </p>
          )}
        </div>
      </div>

      {/* Analysis Button */}
      <div className="flex justify-center">
        <AnalysisButton 
          isDisabled={!file || isAnalyzing || isUploading}
          isAnalyzing={isAnalyzing}
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