import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';
import { ANALYSIS_PROGRESS } from '@/lib/constants';
import { analyzeChunk, generateFinalSummary } from './chunk-analyzer';
import type { ProgressHandler } from './progress-handler';
import type { AnalysisResult } from './types';

export async function processDocument(
  text: string,
  filename: string,
  progress: ProgressHandler
): Promise<AnalysisResult> {
  // Initial preprocessing
  progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.STARTED);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.FILE_READ);

  // Text chunking
  console.log('[Server] Starting text chunking...');
  const chunks = splitIntoChunks(text);
  if (chunks.length === 0) {
    throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
  }
  
  progress.sendProgress('preprocessing', ANALYSIS_PROGRESS.PREPROCESSING);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Start analysis
  progress.sendProgress('analyzing', ANALYSIS_PROGRESS.ANALYSIS_START, 0, chunks.length);

  // Initialize results
  let allKeyTerms: string[] = [];
  let allPotentialRisks: string[] = [];
  let allImportantClauses: string[] = [];
  let allRecommendations: string[] = [];
  let chunkSummaries: string[] = [];

  // Analyze each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkProgress = Math.floor(ANALYSIS_PROGRESS.ANALYSIS_START + 
      ((i + 1) / chunks.length) * (ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START));
    
    progress.sendProgress('analyzing', chunkProgress, i + 1, chunks.length);
    
    const chunkAnalysis = await analyzeChunk(chunks[i], i, chunks.length);
    
    // Aggregate results
    allKeyTerms = [...allKeyTerms, ...chunkAnalysis.keyTerms];
    allPotentialRisks = [...allPotentialRisks, ...chunkAnalysis.potentialRisks];
    allImportantClauses = [...allImportantClauses, ...chunkAnalysis.importantClauses];
    allRecommendations = [...allRecommendations, ...(chunkAnalysis.recommendations || [])];
    chunkSummaries.push(chunkAnalysis.summary);
  }

  // Start final summary
  progress.sendProgress('analyzing', ANALYSIS_PROGRESS.SUMMARY_START);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate final summary
  console.log('[Server] Generating final summary...');
  const summaryContent = await generateFinalSummary(
    chunkSummaries,
    allKeyTerms,
    allPotentialRisks,
    allImportantClauses,
    allRecommendations
  );

  // Summary generated
  progress.sendProgress('analyzing', ANALYSIS_PROGRESS.SUMMARY_GENERATION);
  await new Promise(resolve => setTimeout(resolve, 500));

  // Start result preparation
  progress.sendProgress('analyzing', ANALYSIS_PROGRESS.RESULT_PREPARATION);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Prepare final result
  return {
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
}