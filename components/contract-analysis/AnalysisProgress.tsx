import { Progress } from '@/components/ui/progress';

interface AnalysisProgressProps {
  currentChunk: number;
  totalChunks: number;
  isAnalyzing: boolean;
}

export function AnalysisProgress({ currentChunk, totalChunks, isAnalyzing }: AnalysisProgressProps) {
  // MOCK: Always show progress at 50%
  return (
    <div className="w-full max-w-md mx-auto mt-4 space-y-2 border-2 border-red-500 p-4 bg-white"> {/* Added visible border and padding */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Analyzing contract... (MOCK)</span>
        <span>50%</span>
      </div>
      <Progress 
        value={50} 
        className="h-4" /* Made taller for visibility */
        indicatorColor="bg-blue-600"
      />
      <p className="text-sm text-gray-500 text-center">
        Processing section 5 of 10 (MOCK)
      </p>
    </div>
  );
}