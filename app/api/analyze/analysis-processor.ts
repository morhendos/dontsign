import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';
import { analyzeChunk, generateDocumentSummary } from './chunk-analyzer';
import type { ProgressHandler, AnalysisResult } from './types';

// Delay to keep UI responsive
const STEP_TIME = 300;

async function wait(ms: number = STEP_TIME) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export async function processDocument(
  text: string,
  filename: string,
  progress: ProgressHandler
): Promise<AnalysisResult> {
  try {
    // Input validation
    progress.sendProgress('preprocessing', 10, 0, 0, "Validating document...");
    await wait();

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Generate document summary
    progress.sendProgress('analyzing', 30, 0, chunks.length, "Generating document summary...");
    await wait();
    
    const documentSummary = await generateDocumentSummary(text);

    // Analyze document sections
    progress.sendProgress('analyzing', 40, 0, chunks.length, "Starting detailed analysis...");
    await wait();

    const results = [];
    const progressPerChunk = 40 / chunks.length; // Progress from 40% to 80%

    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      progress.sendProgress(
        'analyzing',
        40 + (progressPerChunk * i),
        chunkNumber,
        chunks.length,
        `Analyzing section ${chunkNumber} of ${chunks.length}...`
      );
      
      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      await wait(STEP_TIME / 2); // Shorter wait between chunks
    }

    // Compile results
    progress.sendProgress('analyzing', 90, chunks.length, chunks.length, "Finalizing analysis...");
    await wait();
    
    const result = {
      summary: documentSummary,
      potentialRisks: [...new Set(results.flatMap(r => r.potentialRisks))].filter(Boolean),
      importantClauses: [...new Set(results.flatMap(r => r.importantClauses))].filter(Boolean),
      recommendations: [...new Set(results.flatMap(r => r.recommendations || []))].filter(Boolean),
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: filename,
        modelVersion: "gpt-3.5-turbo-1106",
        totalChunks: chunks.length
      }
    };

    // Complete
    progress.sendProgress('complete', 100, chunks.length, chunks.length, "Analysis complete!");

    return result;
  } catch (error) {
    console.error('[Server Process Error]', error);
    throw error;
  }
}