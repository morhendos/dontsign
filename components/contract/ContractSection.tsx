import { ContractUploadSection } from './ContractUploadSection';
import { ContractAnalysisSection } from './ContractAnalysisSection';
import { ErrorDisplay } from '../error/ErrorDisplay';
import type { ErrorDisplay as ErrorDisplayType } from '@/types/analysis';
import type { AnalysisResult } from '@/types/analysis';
import type { AnalysisStage } from '../hero/hooks/useContractAnalysis';

interface ContractSectionProps {
  // Upload props
  file: File | null;
  error: ErrorDisplayType | null;
  isAnalyzing: boolean;
  isProcessing: boolean;
  analysisProgress: number;
  processingStatus: string;
  onFileSelect: (file: File | null) => void;
  onAnalyze: (file: File | null) => void;

  // Analysis props
  analysis: AnalysisResult | null;
  currentChunk: number;
  totalChunks: number;
  stage: AnalysisStage;
  showResults: boolean;
  onShowResults: () => void;
  onHideResults: () => void;
  showLog: boolean;
}

export function ContractSection({
  // Upload props
  file,
  error,
  isAnalyzing,
  isProcessing,
  analysisProgress,
  processingStatus,
  onFileSelect,
  onAnalyze,

  // Analysis props
  analysis,
  currentChunk,
  totalChunks,
  stage,
  showResults,
  onShowResults,
  onHideResults,
  showLog
}: ContractSectionProps) {
  return (
    <div className="space-y-6">
      <ContractUploadSection 
        file={file}
        error={error}
        isAnalyzing={isAnalyzing}
        isProcessing={isProcessing}
        analysisProgress={analysisProgress}
        processingStatus={processingStatus}
        onFileSelect={onFileSelect}
        onAnalyze={onAnalyze}
      />

      {error && <ErrorDisplay error={error} />}

      <ContractAnalysisSection 
        analysis={analysis}
        currentChunk={currentChunk}
        totalChunks={totalChunks}
        isAnalyzing={isAnalyzing}
        stage={stage}
        progress={analysisProgress}
        showResults={showResults}
        onShowResults={onShowResults}
        onHideResults={onHideResults}
        showLog={showLog}
      />
    </div>
  );
}
