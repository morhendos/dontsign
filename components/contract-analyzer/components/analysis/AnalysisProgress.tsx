import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  currentChunk: number;
  totalChunks: number;
  isAnalyzing: boolean;
  stage: 'preprocessing' | 'analyzing' | 'complete';
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
  if (!isAnalyzing && progress === 0) return null;

  const baseColor = stage === 'complete' ? 'green' : 'blue';

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
        className={`h-2 bg-${baseColor}-600/20 dark:bg-${baseColor}-500/20`}
        indicatorColor={`bg-${baseColor}-600 dark:bg-${baseColor}-500`}
      />

      {stage === 'analyzing' && currentChunk > 0 && totalChunks > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Processing section {currentChunk} of {totalChunks}
        </div>
      )}
    </div>
  );
};