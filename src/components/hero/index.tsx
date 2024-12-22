import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ContractUpload from '@/components/contract-upload';
import ContractAnalysis from '@/components/contract-analysis';
import AnalysisResults from '@/components/analysis-results';
import ErrorDisplay from '@/components/error';
import AnalysisProgressLog from '@/components/analysis-progress-log';
import { useAnalysisLog } from '@/hooks/useAnalysisLog';
import { analyzeContract } from '@/app/actions';

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  
  const { logs, addLog, completeCurrentPhase, resetLogs } = useAnalysisLog();

  const handleAnalysis = async () => {
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      resetLogs();

      // Start analysis process
      addLog('Initializing document analysis...');
      
      // File processing phase
      addLog('Processing document...');
      const text = await processDocument(file);
      
      // Contract analysis phase
      addLog('Analyzing contract terms and conditions...');
      const result = await analyzeContract(text);
      
      // Generate recommendations
      addLog('Generating recommendations and insights...');
      setAnalysis(result);
      
      completeCurrentPhase();
      addLog('Analysis complete!');
      
    } catch (err) {
      setError({
        title: 'Analysis Error',
        message: err.message || 'An error occurred during analysis'
      });
      completeCurrentPhase();
      addLog('Error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <ContractUpload
        onFileSelect={setFile}
        onError={setError}
      />
      
      <ContractAnalysis
        file={file}
        onAnalyze={handleAnalysis}
        isAnalyzing={isAnalyzing}
      />
      
      {/* Analysis Progress Log */}
      {logs.length > 0 && (
        <AnalysisProgressLog 
          logs={logs}
          className="mt-6 animate-slideIn"
        />
      )}
      
      {error && (
        <ErrorDisplay
          title={error.title}
          message={error.message}
        />
      )}
      
      {analysis && (
        <AnalysisResults
          analysis={analysis}
        />
      )}
    </div>
  );
};

export default Hero;