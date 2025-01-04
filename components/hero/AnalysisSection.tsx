import { useCallback } from 'react';
import { FileUploadArea } from '../contract-upload/FileUploadArea';
import { AnalysisButton } from '../contract-analysis/AnalysisButton';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import { AnalysisHistory } from '../analysis-history/AnalysisHistory';
import { FileText } from 'lucide-react';
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
      <div className="flex flex-col items-center mb-12 relative">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white text-center mb-4">
          Don't Sign Until<br />You're Sure
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl text-center">
          Upload your contract, let AI highlight the risks and key terms.
        </p>

        {hasStoredAnalyses && (
          <div className="absolute right-0 top-0">
            <AnalysisHistory onSelect={onSelectStoredAnalysis} />
          </div>
        )}
      </div>

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
            {/* Status Message */}
            <div className="text-center font-medium text-gray-700 dark:text-gray-200">
              {processingStatus}
            </div>

            {/* Progress Details */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {stage === 'preprocessing' ? 'Preparing document' :
               stage === 'analyzing' && currentChunk > 0 && totalChunks > 0 ?
                 `Processing section ${currentChunk} of ${totalChunks}` :
               stage === 'analyzing' ? 'Analyzing document' :
               'Analysis complete'}
            </div>

            {/* Progress Bar */}
            <AnalysisProgress 
              currentChunk={currentChunk}
              totalChunks={totalChunks}
              isAnalyzing={isAnalyzing}
              stage={stage}
              progress={progress}
            />
          </div>
        )}
      </div>

      {error && <ErrorDisplay error={error} />}
      
      {showAnalysisButton && (
        <button
          onClick={() => onShowResults(true)}
          className="fixed bottom-4 right-4 z-40 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border border-gray-200 dark:border-gray-700 transition-all duration-200 flex items-center gap-2 hover:shadow-xl"
        >
          <FileText className="w-5 h-5" />
          <span>Show Analysis</span>
        </button>
      )}
      
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