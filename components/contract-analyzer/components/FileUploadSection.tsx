import { FileUploadArea } from '../../contract-upload/FileUploadArea';
import { AnalysisButton } from '../../contract-analysis/AnalysisButton';

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
  return (
    <div className="space-y-6">
      <FileUploadArea 
        file={file}
        error={error}
        onFileSelect={onFileSelect}
        isUploading={isUploading}
        processingStatus={processingStatus}
      />

      <div className="flex justify-center">
        <AnalysisButton
          isDisabled={!file || isAnalyzing || isUploading}
          isAnalyzing={isAnalyzing}
          onClick={onAnalyze}
        />
      </div>
    </div>
  );
};