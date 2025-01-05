import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  currentChunk: number;
  totalChunks: number;
  isAnalyzing: boolean;
  stage: 'preprocessing' | 'analyzing' | 'complete';
  progress: number;
  processingStatus?: string;
}

export function AnalysisProgress({ 
  currentChunk, 
  totalChunks, 
  isAnalyzing, 
  stage, 
  progress,
  processingStatus
}: AnalysisProgressProps) {
  // Show progress bar while analyzing or if we have any progress
  if (!isAnalyzing && progress === 0) return null;
  
  return (
    <div className="w-full max-w-md mx-auto mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          {/* Use server-provided message when available */}
          {processingStatus || (
            stage === 'preprocessing' ? 'Preparing' : 
            stage === 'analyzing' && currentChunk > 0 && totalChunks > 0 ? 
              `Analyzing section ${currentChunk} of ${totalChunks}` :
            stage === 'analyzing' ? 'Analyzing' :
            'Complete'
          )}
        </span>
        <span className="text-gray-600 dark:text-gray-300">
          {progress}%
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2"
        indicatorColor={stage === 'complete' ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'}
      />
    </div>
  );
}