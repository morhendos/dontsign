import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';
import { ANALYSIS_PROGRESS, progressMessages } from '@/lib/constants';
import { analyzeChunk, generateFinalSummary } from './chunk-analyzer';
import type { ProgressHandler, AnalysisResult } from './types';

const MIN_STEP_TIME = 200;

async function wait(ms: number = MIN_STEP_TIME) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export async function processDocument(
  text: string,
  filename: string,
  progress: ProgressHandler
): Promise<AnalysisResult> {
  try {
    // Initialize phase
    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.STARTED, 0, 0, 
      progressMessages.STARTED);
    
    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.FILE_READ, 0, 0,
      progressMessages.FILE_READ);

    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.INPUT_VALIDATION, 0, 0,
      progressMessages.INPUT_VALIDATION);

    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.PREPROCESSING_START, 0, 0,
      progressMessages.PREPROCESSING_START);

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Model initialization
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.MODEL_INIT, 0, chunks.length,
      progressMessages.MODEL_INIT);
    await wait();
    
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.MODEL_READY, 0, chunks.length,
      progressMessages.MODEL_READY);
    await wait();

    // Start analysis phase
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.ANALYSIS_START, 0, chunks.length,
      progressMessages.ANALYSIS_START);

    // Initialize result arrays
    let allKeyTerms: string[] = [];
    let allPotentialRisks: string[] = [];
    let allImportantClauses: string[] = [];
    let allRecommendations: string[] = [];
    let chunkSummaries: string[] = [];

    // For single chunk, show intermediate progress
    if (chunks.length === 1) {
      progress.sendProgress('analyzing', ANALYSIS_PROGRESS.ANALYSIS_PROCESSING, 0, 1,
        progressMessages.ANALYSIS_PROCESSING);
      await wait();
      
      progress.sendProgress('analyzing', ANALYSIS_PROGRESS.ANALYSIS_MIDPOINT, 0, 1,
        progressMessages.ANALYSIS_MIDPOINT);
      await wait();
      
      progress.sendProgress('analyzing', ANALYSIS_PROGRESS.ANALYSIS_FINALIZING, 0, 1,
        progressMessages.ANALYSIS_FINALIZING);
      await wait();
    }

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      
      progress.sendProgress(
        'analyzing', 
        ANALYSIS_PROGRESS.ANALYSIS_START + ((chunkNumber / chunks.length) * 
          (ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START)),
        chunkNumber,
        chunks.length,
        `Analyzing section ${chunkNumber} of ${chunks.length}: Identifying key terms and clauses...`
      );
      
      const chunkAnalysis = await analyzeChunk(chunks[i], i, chunks.length);
      
      // Aggregate results
      allKeyTerms = [...allKeyTerms, ...chunkAnalysis.keyTerms];
      allPotentialRisks = [...allPotentialRisks, ...chunkAnalysis.potentialRisks];
      allImportantClauses = [...allImportantClauses, ...chunkAnalysis.importantClauses];
      allRecommendations = [...allRecommendations, ...(chunkAnalysis.recommendations || [])];
      chunkSummaries.push(chunkAnalysis.summary);
      
      await wait(100);
    }

    // Summary phase
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.SUMMARY_START, chunks.length, chunks.length,
      progressMessages.SUMMARY_START);

    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.RISKS, chunks.length, chunks.length,
      progressMessages.RISKS);

    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.RECOMMENDATIONS, chunks.length, chunks.length,
      progressMessages.RECOMMENDATIONS);

    // Generate final summary
    const summaryContent = await generateFinalSummary(
      chunkSummaries,
      allKeyTerms,
      allPotentialRisks,
      allImportantClauses,
      allRecommendations
    );

    // Final steps
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.RESULT_PREPARATION, chunks.length, chunks.length,
      progressMessages.RESULT_PREPARATION);
    
    // Prepare final result
    const result = {
      summary: summaryContent,
      keyTerms: Array.from(new Set(allKeyTerms)),
      potentialRisks: Array.from(new Set(allPotentialRisks)),
      importantClauses: Array.from(new Set(allImportantClauses)),
      recommendations: Array.from(new Set(allRecommendations)),
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: filename,
        modelVersion: "gpt-3.5-turbo-1106",
        totalChunks: chunks.length
      }
    };

    // Complete
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.COMPLETE, chunks.length, chunks.length,
      progressMessages.COMPLETE);

    return result;
  } catch (error) {
    console.error('[Server Process Error]', error);
    throw error;
  }
}