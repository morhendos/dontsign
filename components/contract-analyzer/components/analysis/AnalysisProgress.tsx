import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  sectionsAnalyzed: number;
  totalChunks: number;
  isAnalyzing: boolean;
  stage: 'preprocessing' | 'analyzing' | 'complete';
  progress: number;
  processingStatus: string;
}

export const AnalysisProgress = ({
  sectionsAnalyzed,
  totalChunks,
  isAnalyzing,
  stage,
  progress,
  processingStatus
}: AnalysisProgressProps) => {
  if (!isAnalyzing && progress === 0) return null;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          {processingStatus}
        </span>
        <span className="text-gray-600 dark:text-gray-300">
          {progress}%
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2"
        indicatorClassName={stage === 'complete' 
          ? 'bg-green-600 dark:bg-green-500' 
          : 'bg-blue-600 dark:bg-blue-500'}
      />

      {stage === 'analyzing' && sectionsAnalyzed > 0 && totalChunks > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Processing section {sectionsAnalyzed} of {totalChunks}
        </div>
      )}
    </div>
  );
};