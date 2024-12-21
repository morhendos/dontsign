"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { trackUserInteraction } from '@/lib/analytics-events';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisResults } from '@/components/AnalysisResults';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useContractAnalysis } from '@/hooks/useContractAnalysis';

export default function Hero() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    file,
    error: fileError,
    handleDrop,
    handleFileChange,
    handleFileSelection,
  } = useFileUpload();

  const {
    analysis,
    isAnalyzing,
    error: analysisError,
    handleAnalyze,
  } = useContractAnalysis();

  const handleAreaClick = () => {
    trackUserInteraction('upload_area_click');
    fileInputRef.current?.click();
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 tracking-tight text-gray-900 text-center">
          Don't Sign Until
          <br />
          You're Sure
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto text-center">
          Upload your contract, let AI highlight the risks and key terms.
        </p>

        <FileUpload
          ref={fileInputRef}
          file={file}
          error={fileError}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onClick={handleAreaClick}
          inputId="contract-file-upload"
        />

        <div className="flex justify-center mt-6" role="region" aria-label="Contract analysis controls">
          <Button
            variant="default"
            disabled={!file || isAnalyzing}
            onClick={() => handleAnalyze(file)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin mr-2" aria-hidden="true" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze Contract</span>
                <ArrowRight className="ml-2" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>

        {(fileError || analysisError) && (
          <ErrorMessage error={fileError || analysisError} />
        )}

        {analysis && (
          <div role="region" aria-label="Analysis results">
            <AnalysisResults analysis={analysis} />
          </div>
        )}
      </div>
    </section>
  );
}
