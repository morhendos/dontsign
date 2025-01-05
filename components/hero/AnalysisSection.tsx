import { useCallback } from 'react';
import { FileUploadArea } from '../contract-upload/FileUploadArea';
import { AnalysisButton } from '../contract-analysis/AnalysisButton';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import { AnalysisHistory } from '../analysis-history/AnalysisHistory';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
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
    <section className="w-full">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
        <div className="max-w-5xl mx-auto py-20">
          {/* Hero section */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Don't Sign Until<br />You're Sure
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload your contract, let AI highlight the risks and key terms.
            </p>
          </div>

          {/* Analysis History */}
          {hasStoredAnalyses && (
            <div className="mb-8 flex justify-center">
              <AnalysisHistory onSelect={onSelectStoredAnalysis}>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 border-gray-300 dark:border-gray-700"
                >
                  <History className="w-5 h-5" />
                  Previous Analyses
                </Button>
              </AnalysisHistory>
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
      </div>
    </section>
  );
};
