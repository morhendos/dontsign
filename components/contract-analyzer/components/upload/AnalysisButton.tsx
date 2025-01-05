import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PlayCircle } from 'lucide-react';

interface AnalysisButtonProps {
  isDisabled: boolean;
  isAnalyzing: boolean;
  onClick: () => void;
}

export const AnalysisButton = ({
  isDisabled,
  isAnalyzing,
  onClick
}: AnalysisButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      size="lg"
      className="gap-2"
    >
      {isAnalyzing ? (
        <>
          <LoadingSpinner className="w-5 h-5" />
          Analyzing...
        </>
      ) : (
        <>
          <PlayCircle className="w-5 h-5" />
          Analyze Contract
        </>
      )}
    </Button>
  );
};