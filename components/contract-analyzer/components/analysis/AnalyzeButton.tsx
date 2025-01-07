import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  isDisabled: boolean;
  isAnalyzing: boolean;
  onClick: () => void;
}

export function AnalyzeButton({ 
  isDisabled, 
  isAnalyzing,
  onClick,
}: AnalyzeButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      size="lg"
      variant="default"
      className="relative min-w-[200px] font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
    >
      {isAnalyzing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Analyzing...</span>
        </div>
      ) : (
        'Analyze Contract'
      )}
    </Button>
  );
}