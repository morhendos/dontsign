'use client';

import { useState, useRef, useEffect } from 'react';
import { useContractAnalysis } from '@/hooks/useContractAnalysis';
import { FileUploadArea } from '../contract-upload/FileUploadArea';
import { AnalysisButton } from '../contract-analysis/AnalysisButton';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import type { ErrorDisplay as ErrorDisplayType } from '@/types/analysis';

export default function Hero() {
  const [file, setFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const {
    analysis,
    isAnalyzing,
    error,
    progress,
    stage,
    handleAnalyze
  } = useContractAnalysis({
    onStatusUpdate: setStatusWithTimeout
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setStatusWithTimeout = (status: string, duration = 2000) => {
    setProcessingStatus(status);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setProcessingStatus(''), duration);
  };

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) {
      const newError: ErrorDisplayType = {
        message: 'Please select a valid PDF or DOCX file.',
        type: 'warning'
      };
      return;
    }

    setStatusWithTimeout('Starting file processing...');
    setFile(selectedFile);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white text-center">
          Don't Sign Until<br />You're Sure
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto text-center">
          Upload your contract, let AI highlight the risks and key terms.
        </p>

        <FileUploadArea 
          file={file}
          error={error}
          onFileSelect={handleFileSelect}
          isUploading={isAnalyzing && progress <= 2}
          processingStatus={processingStatus}
        />

        <div className="flex justify-center mt-6">
          <AnalysisButton
            isDisabled={!file || isAnalyzing}
            isAnalyzing={isAnalyzing}
            onClick={() => handleAnalyze(file)}
          />
        </div>

        <AnalysisProgress 
          currentChunk={analysis?.metadata?.currentChunk ?? 0}
          totalChunks={analysis?.metadata?.totalChunks ?? 0}
          isAnalyzing={isAnalyzing}
          stage={stage}
          progress={progress}
        />

        {error && <ErrorDisplay error={error} />}
        {analysis && <AnalysisResults analysis={analysis} />}
      </div>
    </section>
  );
}
