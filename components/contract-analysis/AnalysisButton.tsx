import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';

interface AnalysisButtonProps {
  isDisabled: boolean;
  isAnalyzing: boolean;
  onClick: () => void;
}

export function AnalysisButton({ isDisabled, isAnalyzing, onClick }: AnalysisButtonProps) {
  return (
    <Button
      variant="default"
      disabled={isDisabled}
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="animate-spin mr-2" />
          Analyzing...
        </>
      ) : (
        <>
          Analyze Contract
          <ArrowRight className="ml-2" />
        </>
      )}
    </Button>
  );
}