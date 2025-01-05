'use client';

import { useAnalyzerState } from './hooks/useAnalyzerState';
import { AnalyzerLayout } from './components/AnalyzerLayout';
import { AnalyzerHeader } from './components/AnalyzerHeader';
import { FileUploadSection } from './components/FileUploadSection';
import { AnalysisControls } from './components/AnalysisControls';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import { AnalysisLog } from '../analysis-log/AnalysisLog';
import { useLogVisibility } from './hooks/useLogVisibility';

/**
 * Main contract analysis component that orchestrates the document analysis workflow
 */
export default function ContractAnalyzer() {
  const {
    // State
    file,
    error,
    isProcessing,
    isAnalyzing,
    processingStatus,
    progress,
    stage,
    currentChunk,
    totalChunks,
    analysis,
    showResults,
    currentStoredAnalysis,
    hasStoredAnalyses,
    entries,

    // Actions
    handleFileSelect,
    handleStartAnalysis,
    handleSelectStoredAnalysis,
    setShowResults,
  } = useAnalyzerState();

  const {
    isVisible: showLog,
    onVisibilityChange: handleVisibilityChange,
  } = useLogVisibility({ entries });

  return (
    <AnalyzerLayout>
      <AnalyzerHeader />
      
      <div className="space-y-8">
        {/* Analysis Controls Section */}
        <AnalysisControls 
          hasStoredAnalyses={hasStoredAnalyses}
          onSelectStoredAnalysis={handleSelectStoredAnalysis}
        />

        {/* File Upload Section */}
        <FileUploadSection 
          file={file}
          error={error}
          onFileSelect={handleFileSelect}
          isUploading={isProcessing || (isAnalyzing && progress <= 2)}
          processingStatus={processingStatus}
          onAnalyze={handleStartAnalysis}
          isAnalyzing={isAnalyzing}
        />

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="w-full max-w-md mx-auto space-y-4">
            <AnalysisProgress 
              currentChunk={currentChunk}
              totalChunks={totalChunks}
              isAnalyzing={isAnalyzing}
              stage={stage}
              progress={progress}
              processingStatus={processingStatus}
            />
          </div>
        )}

        {/* Error Display */}
        {error && <ErrorDisplay error={error} />}
        
        {/* Analysis Results */}
        {((analysis && showResults) || (currentStoredAnalysis && showResults)) && (
          <AnalysisResults 
            analysis={currentStoredAnalysis?.analysis || analysis!} 
            isAnalyzing={isAnalyzing}
            stage={stage}
            onClose={() => setShowResults(false)}
          />
        )}
      </div>

      {/* Analysis Log */}
      {entries.length > 0 && (
        <AnalysisLog 
          entries={entries}
          isVisible={showLog}
          onVisibilityChange={handleVisibilityChange}
        />
      )}
    </AnalyzerLayout>
  );
}