import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AnalysisButtonProps {
  isDisabled: boolean;
  isAnalyzing: boolean;
  onClick: () => void;
  currentStatus?: string;
}

export function AnalysisButton({ 
  isDisabled, 
  isAnalyzing,
  onClick,
  currentStatus
}: AnalysisButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      size="lg"
      className="relative min-w-[200px] font-semibold"
    >
      {isAnalyzing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{currentStatus || 'Analyzing...'}</span>
        </div>
      ) : (
        'Analyze Contract'
      )}
    </Button>
  );
}