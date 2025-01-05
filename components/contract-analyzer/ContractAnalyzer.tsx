'use client';

import { useContractAnalyzer } from './hooks/useContractAnalyzer';
import { AnalyzerLayout, AnalyzerHeader } from './components/layout';
import { AnalysisControls, AnalysisProgress, AnalysisResults } from './components/analysis';
import { FileUploadSection } from './components/upload';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisLog } from '../analysis-log/AnalysisLog';

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
    currentChunk,
    totalChunks,
    analysis,

    // History
    history,

    // UI State
    log,
    results,

    // Actions
    actions
  } = useContractAnalyzer();

  return (
    <AnalyzerLayout>
      <AnalyzerHeader />
      
      <div className="space-y-8">
        {/* Analysis Controls */}
        <AnalysisControls 
          hasStoredAnalyses={history.hasAnalyses}
          onSelectStoredAnalysis={actions.handleSelectStoredAnalysis}
        />

        {/* File Upload Section */}
        <FileUploadSection 
          file={file}
          error={error}
          onFileSelect={actions.handleFileSelect}
          isUploading={isProcessing}
          processingStatus={status}
          onAnalyze={actions.handleStartAnalysis}
          isAnalyzing={isAnalyzing}
        />

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="w-full max-w-md mx-auto">
            <AnalysisProgress 
              currentChunk={currentChunk}
              totalChunks={totalChunks}
              isAnalyzing={isAnalyzing}
              stage={stage}
              progress={progress}
              processingStatus={status}
            />
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorDisplay error={error} />}
        
        {/* Analysis Results */}
        {results.isVisible && analysis && (
          <AnalysisResults 
            analysis={analysis}
            onClose={results.hide}
          />
        )}
      </div>

      {/* Analysis Log */}
      {log.entries.length > 0 && (
        <AnalysisLog 
          entries={log.entries}
          isVisible={log.isVisible}
          onVisibilityChange={log.onVisibilityChange}
        />
      )}
    </AnalyzerLayout>
  );
};