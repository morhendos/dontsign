import { FileUploadArea } from '../contract-upload/FileUploadArea';
import { AnalysisButton } from '../contract-analysis/AnalysisButton';
import type { ErrorDisplay } from '@/types/analysis';

interface ContractUploadSectionProps {
  file: File | null;
  error: ErrorDisplay | null;
  isAnalyzing: boolean;
  isProcessing: boolean;
  analysisProgress: number;
  processingStatus: string;
  onFileSelect: (file: File | null) => void;
  onAnalyze: (file: File | null) => void;
}

export function ContractUploadSection({
  file,
  error,
  isAnalyzing,
  isProcessing,
  analysisProgress,
  processingStatus,
  onFileSelect,
  onAnalyze
}: ContractUploadSectionProps) {
  return (
    <div className="space-y-6">
      <FileUploadArea 
        file={file}
        error={error}
        onFileSelect={onFileSelect}
        isUploading={isProcessing || (isAnalyzing && analysisProgress <= 2)}
        processingStatus={processingStatus}
      />

      <div className="flex justify-center">
        <AnalysisButton
          isDisabled={!file || isAnalyzing || isProcessing}
          isAnalyzing={isAnalyzing}
          onClick={() => onAnalyze(file)}
        />
      </div>
    </div>
  );
}
