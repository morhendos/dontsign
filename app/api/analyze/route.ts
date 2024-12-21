import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('[Server] OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

const BATCH_SIZE = 2;

interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
}

interface ProgressUpdate {
  type: 'progress' | 'complete' | 'error';
  stage: 'preprocessing' | 'analyzing' | 'complete';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  result?: any;
  error?: string;
}

export async function POST(request: NextRequest) {
  console.log('[Server] POST /api/analyze started');

  // Create response headers first
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

    // Create a ReadableStream directly
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initial update
          console.log('[Server] Sending initial update...');
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'progress',
              stage: 'preprocessing',
              progress: 5
            })}\n\n`
          );

          // Process text
          console.log('[Server] Starting text chunking...');
          const chunks = splitIntoChunks(text);
          if (chunks.length === 0) {
            throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
          }
          console.log(`[Server] Text split into ${chunks.length} chunks`);

          // Send preprocessing update
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'progress',
              stage: 'preprocessing',
              progress: 10,
              totalChunks: chunks.length,
              currentChunk: 0
            })}\n\n`
          );

          // Process chunks
          for (let i = 0; i < chunks.length; i++) {
            const progress = Math.floor(15 + ((i + 1) / chunks.length) * 85);
            console.log(`[Server] Processing chunk ${i + 1}/${chunks.length}`);
            
            controller.enqueue(
              `data: ${JSON.stringify({
                type: 'progress',
                stage: 'analyzing',
                progress,
                totalChunks: chunks.length,
                currentChunk: i + 1
              })}\n\n`
            );

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          // Send completion update
          const mockResult = {
            summary: "Analysis complete",
            keyTerms: ["Term 1", "Term 2"],
            potentialRisks: ["Risk 1", "Risk 2"],
            importantClauses: ["Clause 1", "Clause 2"],
            recommendations: ["Recommendation 1"],
            metadata: {
              analyzedAt: new Date().toISOString(),
              documentName: filename.toString(),
              modelVersion: "gpt-3.5-turbo-1106",
              totalChunks: chunks.length
            }
          };

          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'complete',
              stage: 'complete',
              progress: 100,
              result: mockResult
            })}\n\n`
          );

          // Close the stream
          controller.close();
          console.log('[Server] Stream closed successfully');

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
    const errorStream = new ReadableStream({
      start(controller) {
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
    });

    return new Response(errorStream, { headers: responseHeaders });
  }
}