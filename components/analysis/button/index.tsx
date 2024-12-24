import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  isDisabled: boolean;
  isAnalyzing: boolean;
  onClick: () => void;
}

export function AnalysisButton({
  isDisabled,
  isAnalyzing,
  onClick
}: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      size="lg"
      className="min-w-[200px] relative"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Analyze Contract'
      )}
    </Button>
  );
}