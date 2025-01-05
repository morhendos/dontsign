import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import type { AnalysisResult } from '../../types';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onClose: () => void;
}

export const AnalysisResults = ({
  analysis,
  onClose
}: AnalysisResultsProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 shadow-xl relative">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <ScrollArea className="h-[80vh] p-6">
          <div className="space-y-8">
            {/* Summary */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Summary</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{analysis.summary}</p>
            </section>

            {/* Key Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Key Terms</h2>
              <ul className="list-disc pl-5 space-y-2">
                {analysis.keyTerms.map((term, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">{term}</li>
                ))}
              </ul>
            </section>

            {/* Potential Risks */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Potential Risks</h2>
              <ul className="list-disc pl-5 space-y-2">
                {analysis.potentialRisks.map((risk, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">{risk}</li>
                ))}
              </ul>
            </section>

            {/* Important Clauses */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Important Clauses</h2>
              <ul className="list-disc pl-5 space-y-2">
                {analysis.importantClauses.map((clause, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">{clause}</li>
                ))}
              </ul>
            </section>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Recommendations</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{rec}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};