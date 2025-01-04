import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';
import { ANALYSIS_PROGRESS } from '@/lib/constants';
import { analyzeChunk, generateFinalSummary } from './chunk-analyzer';
import type { ProgressHandler, AnalysisResult } from './types';

// Minimum time to show each progress step
const MIN_STEP_TIME = 800;

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
    console.log('[Server Process] Starting initialization');
    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.STARTED);
    await wait();
    
    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.FILE_READ);
    await wait();

    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.INPUT_VALIDATION);
    await wait();

    // Preprocessing phase
    console.log('[Server Process] Starting preprocessing');
    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.PREPROCESSING_START);
    await wait();

    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.TEXT_EXTRACTION);
    await wait();

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.PREPROCESSING_COMPLETE);
    await wait();

    // Model initialization
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.MODEL_INIT);
    await wait();

    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.MODEL_READY);
    await wait();

    // Start analysis phase
    console.log('[Server Process] Starting analysis', { chunks: chunks.length });
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.ANALYSIS_START, 0, chunks.length);
    await wait();

    // Initialize result arrays
    let allKeyTerms: string[] = [];
    let allPotentialRisks: string[] = [];
    let allImportantClauses: string[] = [];
    let allRecommendations: string[] = [];
    let chunkSummaries: string[] = [];

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      console.log('[Server Process] Processing chunk', chunkNumber, 'of', chunks.length);
      
      progress.sendProgress(
        'analyzing', 
        ANALYSIS_PROGRESS.ANALYSIS_START + ((chunkNumber / chunks.length) * 
          (ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START)),
        chunkNumber,
        chunks.length
      );
      
      const chunkAnalysis = await analyzeChunk(chunks[i], i, chunks.length);
      console.log('[Server Process] Chunk analysis complete', { chunk: chunkNumber, terms: chunkAnalysis.keyTerms.length });
      
      // Aggregate results
      allKeyTerms = [...allKeyTerms, ...chunkAnalysis.keyTerms];
      allPotentialRisks = [...allPotentialRisks, ...chunkAnalysis.potentialRisks];
      allImportantClauses = [...allImportantClauses, ...chunkAnalysis.importantClauses];
      allRecommendations = [...allRecommendations, ...(chunkAnalysis.recommendations || [])];
      chunkSummaries.push(chunkAnalysis.summary);
      
      await wait(500); // Shorter wait between chunks
    }

    // Summary phase
    console.log('[Server Process] Starting summary generation');
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.SUMMARY_START);
    await wait();

    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.KEY_TERMS);
    await wait();

    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.RISKS);
    await wait();

    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.RECOMMENDATIONS);
    await wait();

    // Generate final summary
    const summaryContent = await generateFinalSummary(
      chunkSummaries,
      allKeyTerms,
      allPotentialRisks,
      allImportantClauses,
      allRecommendations
    );

    // Finalization phase
    console.log('[Server Process] Preparing final result');
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.RESULT_PREPARATION);
    await wait();
    
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

    console.log('[Server Process] Analysis complete');
    return result;
  } catch (error) {
    console.error('[Server Process Error]', error);
    throw error;
  }
}