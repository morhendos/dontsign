import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  currentChunk: number;
  totalChunks: number;
  isAnalyzing: boolean;
  stage: 'preprocessing' | 'analyzing' | 'complete';
  progress: number;
}

export function AnalysisProgress({ 
  currentChunk, 
  totalChunks, 
  isAnalyzing, 
  stage, 
  progress 
}: AnalysisProgressProps) {
  // Show progress bar while analyzing or if we have any progress
  if (!isAnalyzing && currentChunk === 0) return null;

  const calculatedProgress = totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;
  const isComplete = currentChunk === totalChunks && totalChunks > 0;
  
  return (
    <div className="w-full max-w-md mx-auto mt-4 space-y-2">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
        <span>
          {stage === 'complete' 
            ? 'Analysis complete!' 
            : stage === 'preprocessing'
              ? 'Preparing document...'
              : currentChunk === 0 
                ? 'Starting analysis...'
                : 'Analyzing contract...'}
        </span>
        <div>
          <span className="mr-4">[Debug] Overall: {progress}%</span>
          <span>Chunks: {calculatedProgress}%</span>
        </div>
      </div>
      <Progress 
        value={progress} 
        className="h-2"
        indicatorColor={stage === 'complete' ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'}
      />
      {stage === 'analyzing' && totalChunks > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Processing section {currentChunk} of {totalChunks}
        </p>
      )}
    </div>
  );
}