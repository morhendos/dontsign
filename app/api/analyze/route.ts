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

async function analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number) {
  const prompt = `Analyze the following contract text and provide a structured analysis. 
This is chunk ${chunkIndex + 1} of ${totalChunks}.

Contract text:
${chunk}

Provide your analysis in the following format:
1. Key Terms: List the important terms and definitions
2. Potential Risks: Identify any concerning clauses or potential risks
3. Important Clauses: Highlight significant clauses and their implications
4. Recommendations: Suggest points for review or negotiation`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: "You are a legal analysis assistant specialized in contract review. Focus on identifying key terms, potential risks, and important clauses. Be concise and precise."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  const analysis = JSON.parse(response.choices[0].message.content);
  return analysis;
}

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

          // Process chunks and aggregate results
          let allKeyTerms: string[] = [];
          let allPotentialRisks: string[] = [];
          let allImportantClauses: string[] = [];
          let allRecommendations: string[] = [];

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

            // Analyze chunk with OpenAI
            const chunkAnalysis = await analyzeChunk(chunks[i], i, chunks.length);
            
            // Aggregate results
            allKeyTerms = [...allKeyTerms, ...chunkAnalysis.keyTerms];
            allPotentialRisks = [...allPotentialRisks, ...chunkAnalysis.potentialRisks];
            allImportantClauses = [...allImportantClauses, ...chunkAnalysis.importantClauses];
            allRecommendations = [...allRecommendations, ...chunkAnalysis.recommendations];
          }

          // Generate final summary
          const summaryPrompt = `Summarize the following analysis of a contract:
          Key Terms: ${allKeyTerms.join(', ')}
          Potential Risks: ${allPotentialRisks.join(', ')}
          Important Clauses: ${allImportantClauses.join(', ')}
          Recommendations: ${allRecommendations.join(', ')}

          Provide a concise executive summary.`;

          const summaryResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
              {
                role: "system",
                content: "You are a legal analysis assistant. Provide a concise executive summary of the contract analysis."
              },
              {
                role: "user",
                content: summaryPrompt
              }
            ],
            temperature: 0.3
          });

          // Prepare final result
          const finalResult = {
            summary: summaryResponse.choices[0].message.content,
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

          // Send completion update
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'complete',
              stage: 'complete',
              progress: 100,
              result: finalResult
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