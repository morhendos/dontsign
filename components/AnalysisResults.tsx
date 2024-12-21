import { CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

interface AnalysisSectionProps {
  title: string;
  items: string[] | undefined;
  icon: React.ReactNode;
  iconColor: string;
}

const AnalysisSection = ({ title, items, icon, iconColor }: AnalysisSectionProps) => {
  if (!items?.length) return null;
  
  return (
    <div 
      className="mb-6 px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-100"
      role="region"
      aria-label={title}
    >
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
        <span className={iconColor}>{icon}</span>
        {title}
      </h3>
      <ul className="list-disc pl-6 space-y-2" role="list">
        {items.map((item, index) => (
          <li key={index} className="text-gray-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
  const sections = [
    {
      title: 'Key Terms',
      items: analysis.keyTerms,
      icon: <CheckCircle className="w-5 h-5" aria-hidden="true" />,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Potential Risks',
      items: analysis.potentialRisks,
      icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
      iconColor: 'text-red-500'
    },
    {
      title: 'Important Clauses',
      items: analysis.importantClauses,
      icon: <FileText className="w-5 h-5" aria-hidden="true" />,
      iconColor: 'text-gray-500'
    },
    {
      title: 'Recommendations',
      items: analysis.recommendations,
      icon: <Clock className="w-5 h-5" aria-hidden="true" />,
      iconColor: 'text-green-500'
    }
  ];

  return (
    <div className="mt-8 space-y-6">
      <div 
        className="px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-100"
        role="region"
        aria-label="Analysis Summary"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Analysis Summary</h2>
        <p className="text-gray-700 text-lg leading-relaxed">{analysis.summary}</p>
      </div>

      {sections.map((section) => (
        <AnalysisSection key={section.title} {...section} />
      ))}

      {analysis.metadata && (
        <div 
          className="px-6 py-4 bg-gray-50 rounded-lg text-sm text-gray-500 space-y-1"
          role="contentinfo"
          aria-label="Analysis metadata"
        >
          <p>
            Analysis completed on:{' '}
            {new Date(analysis.metadata.analyzedAt).toLocaleString()}
          </p>
          {analysis.metadata.totalChunks && (
            <p>Document sections analyzed: {analysis.metadata.totalChunks}</p>
          )}
        </div>
      )}
    </div>
  );
};

AnalysisResults.displayName = 'AnalysisResults';
