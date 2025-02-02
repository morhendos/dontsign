'use client';

import { useContractAnalyzer } from './hooks/useContractAnalyzer';
import { AnalyzerLayout, AnalyzerHeader } from './components/layout';
import {
  AnalysisControls,
  AnalysisProgress,
  AnalysisResults,
} from './components/analysis';
import { FileUploadSection } from './components/upload';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisLog } from '../analysis-log/AnalysisLog';
import { DisclaimerCheckbox } from '../legal/DisclaimerCheckbox';
import { useLegalAcknowledgment } from '@/lib/hooks/useLegalAcknowledgment';

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

  // Pass the current file name as documentId to ensure checkbox resets for each new file
  const { hasAccepted, acceptDisclaimer } = useLegalAcknowledgment({
    documentId: file?.name
  });

  return (
    <AnalyzerLayout>
      {/* Header with Analysis Controls */}
      <div className="">
        <AnalyzerHeader />
        {history.hasAnalyses && (
          <AnalysisControls
            hasStoredAnalyses={history.hasAnalyses}
            onSelectStoredAnalysis={actions.handleSelectStoredAnalysis}
          />
        )}
      </div>

      <div className="space-y-8">
        {/* File Upload Section */}
        <FileUploadSection
          file={file}
          error={error}
          onFileSelect={actions.handleFileSelect}
          isUploading={isProcessing}
          processingStatus={status}
          onAnalyze={hasAccepted ? actions.handleStartAnalysis : undefined}
          isAnalyzing={isAnalyzing}
          isAnalyzed={isAnalyzed}
          hasAcceptedDisclaimer={hasAccepted}
        />

        {/* Disclaimer Checkbox - Show when file is selected but analysis hasn't started */}
        {file && !isAnalyzing && !isAnalyzed && (
          <div className="w-full max-w-2xl mx-auto">
            <DisclaimerCheckbox
              accepted={hasAccepted}
              onAccept={acceptDisclaimer}
            />
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && !error && (
          <div className="w-full max-w-md mx-auto">
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