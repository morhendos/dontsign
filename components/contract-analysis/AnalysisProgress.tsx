import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  currentChunk: number;
  totalChunks: number;
  isAnalyzing: boolean;
}

export function AnalysisProgress({ currentChunk, totalChunks, isAnalyzing }: AnalysisProgressProps) {
  // Only hide when not analyzing AND we haven't started yet
  if (!isAnalyzing && currentChunk === 0) return null;

  const progress = Math.round((currentChunk / totalChunks) * 100) || 0;
  
  return (
    <div className="w-full max-w-md mx-auto mt-4 space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Analyzing contract...</span>
        <span>{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2"
        indicatorColor={progress === 100 ? 'bg-green-600' : 'bg-blue-600'}
      />
      <p className="text-sm text-gray-500 text-center">
        Processing section {currentChunk} of {totalChunks}
      </p>
    </div>
  );
}