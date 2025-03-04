'use client';

import { useEffect } from 'react';
import { AnalyzerLayout, AnalyzerHeader } from './components/layout';
import {
  AnalysisProgress,
  AnalysisResults,
} from './components/analysis';
import { FileUploadSection } from './components/upload';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisLog } from '../analysis-log/AnalysisLog';
import { useContractAnalyzer } from './hooks/useContractAnalyzer';

declare global {
  interface Window {
    handleAnalysisSelect?: (analysis: any) => void;
  }
}

/**
 * Main contract analysis component that orchestrates the analysis workflow
 */
export const ContractAnalyzer = () => {
  const {
    // State
    file,
    error,
    isProcessing,
    isAnalyzing,
    status,
    progress,
    stage,
    sectionsAnalyzed,
    totalChunks,
    analysis,
    isAnalyzed,

    // History
    history,

    // UI State
    log,
    results,

    // Actions
    actions,
  } = useContractAnalyzer();

  // Register global handler for history selection
  useEffect(() => {
    window.handleAnalysisSelect = actions.handleSelectStoredAnalysis;
    return () => {
      delete window.handleAnalysisSelect;
    };
  }, [actions.handleSelectStoredAnalysis]);

  return (
    <AnalyzerLayout>
      {/* Header */}
      <div className="w-full">
        <AnalyzerHeader />
      </div>

      <div className="w-full">
        {/* File Upload Section */}
        <FileUploadSection
          file={file}
          error={error}
          onFileSelect={actions.handleFileSelect}
          isUploading={isProcessing}
          processingStatus={status}
          onAnalyze={actions.handleStartAnalysis}
          isAnalyzing={isAnalyzing}
          isAnalyzed={isAnalyzed}
          hasAcceptedDisclaimer={true}
        />

        {/* Analysis Progress */}
        {isAnalyzing && !error && (
          <div className="w-full">
            <AnalysisProgress
              sectionsAnalyzed={sectionsAnalyzed}
              totalChunks={totalChunks}
              isAnalyzing={isAnalyzing}
              stage={stage}
              progress={progress}
              processingStatus={status}
            />
          </div>
        )}

        {/* Analysis Results or Error Display */}
        {error ? (
          <AnalysisResults
            analysis={null}
            error={error}
            onClose={() => actions.handleClearError()}
          />
        ) : results.isVisible && analysis ? (
          <AnalysisResults
            analysis={analysis}
            error={null}
            onClose={() => results.hide()}
          />
        ) : null}
      </div>

      {/* Analysis Log */}
      {!error && log.entries.length > 0 && (
        <AnalysisLog
          entries={log.entries}
          isVisible={log.isVisible}
          onVisibilityChange={log.onVisibilityChange}
        />
      )}
    </AnalyzerLayout>
  );
};