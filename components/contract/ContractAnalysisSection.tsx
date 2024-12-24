import { FileText } from 'lucide-react';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import type { AnalysisResult } from '@/types/analysis';
import type { AnalysisStage } from '../hero/hooks/useContractAnalysis';

interface ContractAnalysisSectionProps {
  analysis: AnalysisResult | null;
  currentChunk: number;
  totalChunks: number;
  isAnalyzing: boolean;
  stage: AnalysisStage;
  progress: number;
  showResults: boolean;
  onShowResults: () => void;
  onHideResults: () => void;
  showLog: boolean;
}

export function ContractAnalysisSection({
  analysis,
  currentChunk,
  totalChunks,
  isAnalyzing,
  stage,
  progress,
  showResults,
  onShowResults,
  onHideResults,
  showLog
}: ContractAnalysisSectionProps) {
  // Show Analysis button should only appear when:
  // 1. We have an analysis
  // 2. Results are currently hidden
  // 3. Analysis is complete and not analyzing
  // 4. Log panel is not visible
  const shouldShowAnalysisButton = 
    analysis && 
    !showResults && 
    stage === 'complete' && 
    !isAnalyzing && 
    !showLog;

  return (
    <>
      {isAnalyzing && (
        <AnalysisProgress 
          currentChunk={currentChunk}
          totalChunks={totalChunks}
          isAnalyzing={isAnalyzing}
          stage={stage}
          progress={progress}
        />
      )}
      
      {/* Show floating button only when log panel is not visible */}
      {shouldShowAnalysisButton && (
        <button
          onClick={onShowResults}
          className={`
            fixed bottom-4 right-4 z-40
            bg-white dark:bg-gray-800
            shadow-lg rounded-full p-3
            text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
            border border-gray-200 dark:border-gray-700
            transition-all duration-200
            flex items-center gap-2
            hover:shadow-xl
          `}
        >
          <FileText className="w-5 h-5" />
          <span>Show Analysis</span>
        </button>
      )}
      
      {analysis && showResults && (
        <AnalysisResults 
          analysis={analysis} 
          isAnalyzing={isAnalyzing}
          stage={stage}
          onClose={onHideResults}
        />
      )}
    </>
  );
}
