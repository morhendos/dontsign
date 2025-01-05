import { Progress } from '@/components/ui/progress';
import { useAnalysisProgress } from '../../hooks';
import type { AnalysisStage } from '../../types';

interface AnalysisProgressProps {
  currentChunk: number;
  totalChunks: number;
  isAnalyzing: boolean;
  stage: AnalysisStage;
  progress: number;
  processingStatus: string;
}

export const AnalysisProgress = ({
  currentChunk,
  totalChunks,
  isAnalyzing,
  stage,
  progress,
  processingStatus
}: AnalysisProgressProps) => {
  const { description, showChunks } = useAnalysisProgress({
    stage,
    progress,
    currentChunk,
    totalChunks
  });

  if (!isAnalyzing) return null;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>{description || processingStatus}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="w-full" />
      {showChunks && (
        <div className="text-sm text-gray-500 dark:text-gray-500 text-center">
          Processing section {currentChunk} of {totalChunks}
        </div>
      )}
    </div>
  );
};