import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { splitIntoChunks } from '@/lib/text-utils';
import { ContractAnalysisError } from '@/lib/errors';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BATCH_SIZE = 2; // Process 2 chunks at a time for more granular updates

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

async function analyzeChunk(
  chunk: string,
  chunkIndex: number,
  totalChunks: number
): Promise<AnalysisResult> {
  console.log(`[Server] Starting analysis of chunk ${chunkIndex + 1}/${totalChunks}`);
  
  const systemPrompt = "You are a legal expert. Analyze this contract section concisely.";
  const userPrompt = `Section ${chunkIndex + 1}/${totalChunks}:\n${chunk}\n\nProvide JSON with: summary (brief), keyTerms, potentialRisks, importantClauses, recommendations.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  console.log(`[Server] Completed analysis of chunk ${chunkIndex + 1}/${totalChunks}`);

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new ContractAnalysisError(
      'No analysis generated by AI model',
      'API_ERROR'
    );
  }

  return JSON.parse(content) as AnalysisResult;
}

async function processBatch(
  chunks: string[],
  startIndex: number,
  totalChunks: number
): Promise<AnalysisResult[]> {
  console.log(`[Server] Processing batch starting at index ${startIndex}`);
  return Promise.all(
    chunks.map((chunk, idx) => 
      analyzeChunk(chunk, startIndex + idx, totalChunks)
    )
  );
}

export async function POST(request: NextRequest) {
  console.log('[Server] Starting analysis process');
  
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  async function sendUpdate(update: ProgressUpdate) {
    console.log('[Server] Sending update:', update);
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(update)}\n\n`)
    );
  }

  try {
    console.log('[Server] Parsing form data');
    const data = await request.formData();
    const text = data.get('text');
    const filename = data.get('filename');

    if (!text || typeof text !== 'string' || !filename) {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    console.log('[Server] Starting preprocessing');
    await sendUpdate({
      type: 'progress',
      stage: 'preprocessing',
      progress: 5
    });

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    console.log(`[Server] Text split into ${chunks.length} chunks`);
    await sendUpdate({
      type: 'progress',
      stage: 'preprocessing',
      progress: 10,
      totalChunks: chunks.length,
      currentChunk: 0
    });

    const results: AnalysisResult[] = [];
    
    // Process chunks in batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      console.log(`[Server] Starting batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(chunks.length/BATCH_SIZE)}`);
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await processBatch(batchChunks, i, chunks.length);
      
      results.push(...batchResults);
      const currentChunk = Math.min(i + BATCH_SIZE, chunks.length);
      
      // Calculate progress (10-95%)
      const analysisProgress = (currentChunk / chunks.length) * 85;
      const progress = Math.round(10 + analysisProgress);

      await sendUpdate({
        type: 'progress',
        stage: 'analyzing',
        progress,
        currentChunk,
        totalChunks: chunks.length
      });
    }

    console.log('[Server] Analysis complete, merging results');
    // Merge results
    const aiSummaries = results.map(r => r.summary).join('\n');
    const finalAnalysis = {
      summary: `Analysis complete. Found ${results.length} key sections.\n\n\nDetailed Analysis:\n${aiSummaries}`,
      keyTerms: [...new Set(results.flatMap(r => r.keyTerms))],
      potentialRisks: [...new Set(results.flatMap(r => r.potentialRisks))],
      importantClauses: [...new Set(results.flatMap(r => r.importantClauses))],
      recommendations: [...new Set(results.flatMap(r => r.recommendations || []))],
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: filename,
        modelVersion: "gpt-3.5-turbo-1106",
        totalChunks: chunks.length,
        currentChunk: chunks.length,
        stage: 'complete',
        progress: 100
      }
    };

    console.log('[Server] Sending final results');
    // Send completion update with final results
    await sendUpdate({
      type: 'complete',
      stage: 'complete',
      progress: 100,
      result: finalAnalysis
    });

  } catch (error) {
    console.error('[Server] Analysis error:', error);
    await sendUpdate({
      type: 'error',
      stage: 'preprocessing',
      progress: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    console.log('[Server] Closing writer');
    await writer.close();
  }

  console.log('[Server] Returning response stream');
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}