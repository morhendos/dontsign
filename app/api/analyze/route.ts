import { NextRequest } from 'next/server';
import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';
import { ANALYSIS_PROGRESS } from '@/lib/constants';
import { analyzeChunk, generateFinalSummary } from './chunk-analyzer';
import { createProgressHandler, createErrorStream } from './progress-handler';
import type { AnalysisResult } from './types';

export async function POST(request: NextRequest) {
  console.log('[Server] POST /api/analyze started');

  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  try {
    console.log('[Server] Reading request form data...');
    const data = await request.formData();
    console.log('[Server] Form data received, checking content...');
    
    const text = data.get('text');
    const filename = data.get('filename');
    console.log('[Server] Text length:', text?.toString().length);
    console.log('[Server] Filename:', filename);

    if (!text || typeof text !== 'string' || !filename) {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { sendProgress } = createProgressHandler(controller);
          
          // Initial progress
          sendProgress('preprocessing', ANALYSIS_PROGRESS.STARTED);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // File read progress
          sendProgress('preprocessing', ANALYSIS_PROGRESS.FILE_READ);

          // Text chunking
          console.log('[Server] Starting text chunking...');
          const chunks = splitIntoChunks(text);
          if (chunks.length === 0) {
            throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
          }
          
          // Preprocessing complete
          sendProgress('preprocessing', ANALYSIS_PROGRESS.PREPROCESSING);
          await new Promise(resolve => setTimeout(resolve, 500));

          // Analysis start
          sendProgress('analyzing', ANALYSIS_PROGRESS.ANALYSIS_START, 0, chunks.length);

          // Process chunks
          let allKeyTerms: string[] = [];
          let allPotentialRisks: string[] = [];
          let allImportantClauses: string[] = [];
          let allRecommendations: string[] = [];
          let chunkSummaries: string[] = [];

          // Analyze chunks
          for (let i = 0; i < chunks.length; i++) {
            const progress = Math.floor(ANALYSIS_PROGRESS.ANALYSIS_START + 
              ((i + 1) / chunks.length) * (ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START));
            
            sendProgress('analyzing', progress, i + 1, chunks.length);
            const chunkAnalysis = await analyzeChunk(chunks[i], i, chunks.length);
            
            // Aggregate results
            allKeyTerms = [...allKeyTerms, ...chunkAnalysis.keyTerms];
            allPotentialRisks = [...allPotentialRisks, ...chunkAnalysis.potentialRisks];
            allImportantClauses = [...allImportantClauses, ...chunkAnalysis.importantClauses];
            allRecommendations = [...allRecommendations, ...(chunkAnalysis.recommendations || [])];
            chunkSummaries.push(chunkAnalysis.summary);
          }

          // Start summary generation
          sendProgress('analyzing', ANALYSIS_PROGRESS.SUMMARY_START);
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
          sendProgress('analyzing', ANALYSIS_PROGRESS.SUMMARY_GENERATION);
          await new Promise(resolve => setTimeout(resolve, 500));

          // Start result preparation
          sendProgress('analyzing', ANALYSIS_PROGRESS.RESULT_PREPARATION);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Prepare final result
          const finalResult: AnalysisResult & { metadata: any } = {
            summary: summaryContent,
            keyTerms: Array.from(new Set(allKeyTerms)),
            potentialRisks: Array.from(new Set(allPotentialRisks)),
            importantClauses: Array.from(new Set(allImportantClauses)),
            recommendations: Array.from(new Set(allRecommendations)),
            metadata: {
              analyzedAt: new Date().toISOString(),
              documentName: filename.toString(),
              modelVersion: "gpt-3.5-turbo-1106",
              totalChunks: chunks.length
            }
          };

          // Send completion with final result
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'complete',
              stage: 'complete',
              progress: ANALYSIS_PROGRESS.COMPLETE,
              result: finalResult
            })}\n\n`
          );

          controller.close();

        } catch (error) {
          console.error('[Server] Error in stream controller:', error);
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'error',
              stage: 'preprocessing',
              progress: 0,
              error: error instanceof Error ? error.message : 'Unknown error'
            })}\n\n`
          );
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: responseHeaders });

  } catch (error) {
    console.error('[Server] Error in analyze endpoint:', error);
    return new Response(createErrorStream(error), { headers: responseHeaders });
  }
}