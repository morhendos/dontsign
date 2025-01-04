import { useCallback } from 'react';
import { FileUploadArea } from '../contract-upload/FileUploadArea';
import { AnalysisButton } from '../contract-analysis/AnalysisButton';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import { AnalysisHistory } from '../analysis-history/AnalysisHistory';
import { Button } from '@/components/ui/button';
import { History, FileText } from 'lucide-react';
import type { StoredAnalysis } from '@/lib/storage';
import type { AnalysisResult } from '@/types/analysis';
import type { AnalysisStage } from './hooks/useContractAnalysis';

interface AnalysisSectionProps {
  file: File | null;
  error: any;
  isProcessing: boolean;
  isAnalyzing: boolean;
  processingStatus: string;
  progress: number;
  stage: AnalysisStage;
  currentChunk: number;
  totalChunks: number;
  analysis: AnalysisResult | null;
  showResults: boolean;
  currentStoredAnalysis: StoredAnalysis | null;
  hasStoredAnalyses: boolean;
  showAnalysisButton: boolean;
  onFileSelect: (file: File | null) => void;
  onAnalyze: () => void;
  onShowResults: (show: boolean) => void;
  onSelectStoredAnalysis: (analysis: StoredAnalysis) => void;
}

/**
 * HistoryButtonContent component to match styling with other button
 */
const HistoryButtonContent = () => (
  <>
    <History className="w-5 h-5" />
    Previous Analyses
  </>
);

/**
 * Handles the main analysis section including file upload, analysis controls, and results display
 */
export const AnalysisSection = ({
  file,
  error,
  isProcessing,
  isAnalyzing,
  processingStatus,
  progress,
  stage,
  currentChunk,
  totalChunks,
  analysis,
  showResults,
  currentStoredAnalysis,
  hasStoredAnalyses,
  showAnalysisButton,
  onFileSelect,
  onAnalyze,
  onShowResults,
  onSelectStoredAnalysis
}: AnalysisSectionProps) => {
  // Handler for file analysis
  const handleAnalyze = useCallback(() => {
    onAnalyze();
  }, [onAnalyze]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero section */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          Don't Sign Until<br />You're Sure
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload your contract, let AI highlight the risks and key terms.
        </p>
      </div>

      {/* Analysis Controls */}
      {(hasStoredAnalyses || showAnalysisButton) && (
        <div className="mb-8 flex justify-center gap-3">
          {showAnalysisButton && (
            <Button
              variant="default"
              size="lg"
              className="gap-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={() => onShowResults(true)}
            >
              <FileText className="w-5 h-5" />
              View Latest Analysis
            </Button>
          )}
          {hasStoredAnalyses && (
            <AnalysisHistory 
              onSelect={onSelectStoredAnalysis}
              variant="outline"
              size="lg"
              className="gap-2 border-gray-300 dark:border-gray-700"
            >
              <HistoryButtonContent />
            </AnalysisHistory>
          )}
        </div>
      )}

      <FileUploadArea 
        file={file}
        error={error}
        onFileSelect={onFileSelect}
        isUploading={isProcessing || (isAnalyzing && progress <= 2)}
        processingStatus={processingStatus}
      />

      <div className="flex flex-col items-center gap-6 mt-6">
        <AnalysisButton
          isDisabled={!file || isAnalyzing || isProcessing}
          isAnalyzing={isAnalyzing}
          onClick={handleAnalyze}
        />

        {/* Analysis Progress Section */}
        {isAnalyzing && (
          <div className="w-full max-w-md space-y-4">
            <AnalysisProgress 
              currentChunk={currentChunk}
              totalChunks={totalChunks}
              isAnalyzing={isAnalyzing}
              stage={stage}
              progress={progress}
              processingStatus={processingStatus}
            />
          </div>
        )}
      </div>

      {error && <ErrorDisplay error={error} />}
      
      {((analysis && showResults) || (currentStoredAnalysis && showResults)) && (
        <AnalysisResults 
          analysis={currentStoredAnalysis?.analysis || analysis!} 
          isAnalyzing={isAnalyzing}
          stage={stage}
          onClose={() => onShowResults(false)}
        />
      )}
    </div>
  );
};