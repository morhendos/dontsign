import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { AnimatedAppear } from '../ui/animated-appear';

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
  const [isVisible, setIsVisible] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  // Show progress bar while analyzing or if we have any progress
  useEffect(() => {
    if (isAnalyzing || currentChunk > 0) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, currentChunk]);

  // Animate progress value changes
  useEffect(() => {
    const calculatedProgress = totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;
    const increment = (calculatedProgress - progressValue) / 20;
    let frame = 0;

    const animateProgress = () => {
      if (frame < 20) {
        setProgressValue(prev => Math.min(calculatedProgress, prev + increment));
        frame++;
        requestAnimationFrame(animateProgress);
      } else {
        setProgressValue(calculatedProgress);
      }
    };

    if (calculatedProgress !== progressValue) {
      requestAnimationFrame(animateProgress);
    }
  }, [currentChunk, totalChunks]);

  if (!isVisible) return null;

  const isComplete = currentChunk === totalChunks && totalChunks > 0;
  
  return (
    <AnimatedAppear direction="up" duration={400}>
      <div className="w-full max-w-md mx-auto mt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span className="transition-all duration-300">
            {isComplete 
              ? 'Analysis complete!' 
              : currentChunk === 0 
                ? 'Starting analysis...'
                : 'Analyzing contract...'}
          </span>
          <span className="transition-all duration-300">
            {Math.round(progressValue)}%
          </span>
        </div>

        <Progress 
          value={progressValue} 
          className="h-2 transition-all duration-300"
          indicatorColor={`
            ${isComplete ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'}
            transition-colors duration-300
          `}
        />

        {(currentChunk > 0 || totalChunks > 0) && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center transition-opacity duration-300">
            Processing section {currentChunk} of {totalChunks}
          </p>
        )}
      </div>
    </AnimatedAppear>
  );
}
