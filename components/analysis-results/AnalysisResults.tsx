import { CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';
import type { AnalysisResult } from '@/types/analysis';
import { AnalysisSection } from './AnalysisSection';
import { AnimatedAppear } from '../ui/animated-appear';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="mt-8 space-y-6">
      <AnimatedAppear direction="up" duration={400}>
        <div className="px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Analysis Summary</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{analysis.summary}</p>
        </div>
      </AnimatedAppear>

      <AnimatedAppear direction="up" duration={400} delay={100}>
        <AnalysisSection 
          title="Key Terms"
          items={analysis.keyTerms}
          icon={<CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
        />
      </AnimatedAppear>

      <AnimatedAppear direction="up" duration={400} delay={200}>
        <AnalysisSection 
          title="Potential Risks"
          items={analysis.potentialRisks}
          icon={<AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />}
        />
      </AnimatedAppear>

      <AnimatedAppear direction="up" duration={400} delay={300}>
        <AnalysisSection 
          title="Important Clauses"
          items={analysis.importantClauses}
          icon={<FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
        />
      </AnimatedAppear>

      <AnimatedAppear direction="up" duration={400} delay={400}>
        <AnalysisSection 
          title="Recommendations"
          items={analysis.recommendations}
          icon={<Clock className="w-5 h-5 text-green-500 dark:text-green-400" />}
        />
      </AnimatedAppear>

      {analysis.metadata && (
        <AnimatedAppear direction="up" duration={400} delay={500}>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Analysis completed on: {new Date(analysis.metadata.analyzedAt).toLocaleString()}</p>
            {analysis.metadata.totalChunks && (
              <p>Document sections analyzed: {analysis.metadata.totalChunks}</p>
            )}
          </div>
        </AnimatedAppear>
      )}
    </div>
  );
}
