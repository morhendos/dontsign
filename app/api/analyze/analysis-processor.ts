import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';
import { ANALYSIS_PROGRESS } from '@/lib/constants';
import { analyzeChunk, generateFinalSummary } from './chunk-analyzer';
import type { ProgressHandler, AnalysisResult } from './types';

export async function processDocument(
  text: string,
  filename: string,
  progress: ProgressHandler
): Promise<AnalysisResult> {
  try {
    // Initial preprocessing
    console.log('[Server Process] Starting preprocessing');
    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.STARTED);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.FILE_READ);

    // Text chunking
    console.log('[Server Process] Starting text chunking');
    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }
    
    progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.PREPROCESSING);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Start analysis
    console.log('[Server Process] Starting analysis', { chunks: chunks.length });
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.ANALYSIS_START, 0, chunks.length);

    // Initialize results
    let allKeyTerms: string[] = [];
    let allPotentialRisks: string[] = [];
    let allImportantClauses: string[] = [];
    let allRecommendations: string[] = [];
    let chunkSummaries: string[] = [];

    // Analyze each chunk
    for (let i = 0; i < chunks.length; i++) {
      console.log('[Server Process] Processing chunk', i + 1, 'of', chunks.length);
      const chunkProgress = Math.floor(ANALYSIS_PROGRESS.ANALYSIS_START + 
        ((i + 1) / chunks.length) * (ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START));
      
      progress.sendProgress('analyzing', chunkProgress, i + 1, chunks.length);
      
      const chunkAnalysis = await analyzeChunk(chunks[i], i, chunks.length);
      console.log('[Server Process] Chunk analysis complete', { chunk: i + 1, terms: chunkAnalysis.keyTerms.length });
      
      // Aggregate results
      allKeyTerms = [...allKeyTerms, ...chunkAnalysis.keyTerms];
      allPotentialRisks = [...allPotentialRisks, ...chunkAnalysis.potentialRisks];
      allImportantClauses = [...allImportantClauses, ...chunkAnalysis.importantClauses];
      allRecommendations = [...allRecommendations, ...(chunkAnalysis.recommendations || [])];
      chunkSummaries.push(chunkAnalysis.summary);
    }

    // Start final summary
    console.log('[Server Process] Starting summary generation');
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.SUMMARY_START);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate final summary
    const summaryContent = await generateFinalSummary(
      chunkSummaries,
      allKeyTerms,
      allPotentialRisks,
      allImportantClauses,
      allRecommendations
    );

    // Summary generated
    console.log('[Server Process] Summary generation complete');
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.SUMMARY_GENERATION);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Start result preparation
    console.log('[Server Process] Preparing final result');
    progress.sendProgress('analyzing', ANALYSIS_PROGRESS.RESULT_PREPARATION);
    await new Promise(resolve => setTimeout(resolve, 500));
    
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