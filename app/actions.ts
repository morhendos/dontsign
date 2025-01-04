"use server";

import * as Sentry from "@sentry/nextjs";
import { ContractAnalysisError } from "@/lib/errors";
import { splitIntoChunks } from "@/lib/text-utils";
import { openAIService } from "@/lib/services/openai/openai-service";

interface ProgressUpdate {
  type: 'update';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  stage?: string;
  activity?: string;
}

type ProgressCallback = (data: ProgressUpdate) => void;

// Progress stages with descriptions
const PROGRESS_STAGES = [
  { progress: 5, stage: 'preprocessing', activity: "Starting document analysis..." },
  { progress: 10, stage: 'preprocessing', activity: "Validating document content..." },
  { progress: 15, stage: 'preprocessing', activity: "Splitting document into sections..." },
  { progress: 20, stage: 'analyzing', activity: "Initializing AI analysis..." },
  { progress: 70, stage: 'analyzing', activity: "Analyzing document sections..." },
  { progress: 75, stage: 'analyzing', activity: "Generating summary..." },
  { progress: 80, stage: 'analyzing', activity: "Processing key terms..." },
  { progress: 85, stage: 'analyzing', activity: "Identifying potential risks..." },
  { progress: 90, stage: 'analyzing', activity: "Reviewing important clauses..." },
  { progress: 95, stage: 'analyzing', activity: "Preparing final recommendations..." },
  { progress: 100, stage: 'complete', activity: "Analysis complete!" },
] as const;

async function analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number) {
  const response = await openAIService.createChatCompletion({
    model: "gpt-3.5-turbo-1106",
    messages: [
      { role: "system", content: "You are a legal expert. Analyze this contract section concisely." },
      { role: "user", content: `Section ${chunkIndex + 1}/${totalChunks}:\n${chunk}\n\nProvide JSON with: summary (brief), keyTerms, potentialRisks, importantClauses, recommendations.` },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ContractAnalysisError('No analysis generated', 'API_ERROR');
  return JSON.parse(content);
}

export async function analyzeContract(formData: FormData, onProgress: ProgressCallback) {
  try {
    // Initial validation
    onProgress({
      type: 'update',
      progress: 5,
      stage: 'preprocessing',
      activity: "Starting document validation..."
    });

    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    // Content validation
    onProgress({
      type: 'update',
      progress: 10,
      stage: 'preprocessing',
      activity: "Checking document content..."
    });

    if (!text.trim()) {
      throw new ContractAnalysisError("Document appears to be empty", "INVALID_INPUT");
    }

    // Text chunking
    onProgress({
      type: 'update',
      progress: 15,
      stage: 'preprocessing',
      activity: "Processing document structure..."
    });

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Initialize analysis
    onProgress({
      type: 'update',
      progress: 20,
      stage: 'analyzing',
      activity: "Starting AI analysis...",
      currentChunk: 0,
      totalChunks: chunks.length
    });

    // Process chunks
    const results = [];
    const progressPerChunk = (70 - 20) / chunks.length;
    let currentProgress = 20;

    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      onProgress({
        type: 'update',
        progress: Math.min(Math.round(currentProgress), 70),
        stage: 'analyzing',
        currentChunk: chunkNumber,
        totalChunks: chunks.length,
        activity: `Analyzing section ${chunkNumber} of ${chunks.length}`
      });

      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      currentProgress += progressPerChunk;
    }

    // Final processing steps
    const finalSteps = [
      { progress: 75, activity: "Processing section summaries..." },
      { progress: 80, activity: "Consolidating key terms..." },
      { progress: 85, activity: "Analyzing potential risks..." },
      { progress: 90, activity: "Reviewing important clauses..." },
      { progress: 95, activity: "Preparing final recommendations..." }
    ];

    for (const step of finalSteps) {
      onProgress({
        type: 'update',
        progress: step.progress,
        stage: 'analyzing',
        activity: step.activity,
        currentChunk: chunks.length,
        totalChunks: chunks.length
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Prepare final analysis
    const finalAnalysis = {
      summary: `Analysis complete. Found ${results.length} key sections.\n\n${results.map(r => r.summary).join('\n')}`,
      keyTerms: [...new Set(results.flatMap(r => r.keyTerms))],
      potentialRisks: [...new Set(results.flatMap(r => r.potentialRisks))],
      importantClauses: [...new Set(results.flatMap(r => r.importantClauses))],
      recommendations: [...new Set(results.flatMap(r => r.recommendations || []))],
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: filename,
        modelVersion: "gpt-3.5-turbo-1106",
        totalChunks: chunks.length,
        currentChunk: chunks.length
      }
    };

    // Complete
    onProgress({
      type: 'update',
      progress: 100,
      stage: 'complete',
      activity: "Analysis complete! Preparing results...",
      currentChunk: chunks.length,
      totalChunks: chunks.length
    });

    return finalAnalysis;

  } catch (error) {
    console.error("Error in analyzeContract:", error);
    throw error;
  }
}
