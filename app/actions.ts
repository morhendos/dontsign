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

// Progress stages - more granular now
const PROGRESS = {
  START: 5,
  FILE_READ: 10,
  PREPROCESSING: 15,
  TEXT_EXTRACTION: 18,
  ANALYSIS_START: 20,
  // 20-70% for chunk processing (50% total)
  CHUNK_PROCESSING: 70,
  // 70-95% for merging and final steps
  PROCESSING_SUMMARIES: 75,
  CONSOLIDATING_TERMS: 80,
  MERGING_RISKS: 85,
  REVIEWING_CLAUSES: 88,
  COMBINING_RECOMMENDATIONS: 91,
  FINALIZING: 95,
  COMPLETE: 100
} as const;

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
    // Validate input
    onProgress({
      type: 'update',
      progress: PROGRESS.START,
      stage: 'preprocessing',
      activity: "Starting document validation..."
    });

    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    // Text content verification
    onProgress({
      type: 'update',
      progress: PROGRESS.FILE_READ,
      stage: 'preprocessing',
      activity: "Verifying document content..."
    });

    if (!text.trim()) {
      throw new ContractAnalysisError("Document appears to be empty", "INVALID_INPUT");
    }

    // Text chunking
    onProgress({
      type: 'update',
      progress: PROGRESS.TEXT_EXTRACTION,
      stage: 'preprocessing',
      activity: "Extracting document content..."
    });

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Initialize metadata
    const metadata = {
      analyzedAt: new Date().toISOString(),
      documentName: filename,
      modelVersion: "gpt-3.5-turbo-1106",
      totalChunks: chunks.length,
      currentChunk: 0
    };

    // Analysis initialization
    const results = [];
    const progressPerChunk = (PROGRESS.CHUNK_PROCESSING - PROGRESS.ANALYSIS_START) / chunks.length;
    let currentProgress = PROGRESS.ANALYSIS_START;

    // Process chunks with detailed updates
    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      onProgress({
        type: 'update',
        progress: Math.min(Math.round(currentProgress), PROGRESS.CHUNK_PROCESSING),
        stage: 'analyzing',
        currentChunk: chunkNumber,
        totalChunks: chunks.length,
        activity: `Analyzing section ${chunkNumber} of ${chunks.length} (${Math.round((chunkNumber / chunks.length) * 100)}% complete)`
      });

      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      metadata.currentChunk = chunkNumber;
      currentProgress += progressPerChunk;

      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final processing steps with status updates
    for (const step of [
      { progress: PROGRESS.PROCESSING_SUMMARIES, activity: "Processing section summaries..." },
      { progress: PROGRESS.CONSOLIDATING_TERMS, activity: "Consolidating key terms..." },
      { progress: PROGRESS.MERGING_RISKS, activity: "Analyzing potential risks..." },
      { progress: PROGRESS.REVIEWING_CLAUSES, activity: "Reviewing important clauses..." },
      { progress: PROGRESS.COMBINING_RECOMMENDATIONS, activity: "Preparing recommendations..." },
      { progress: PROGRESS.FINALIZING, activity: "Finalizing analysis..." }
    ]) {
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
      metadata
    };

    // Send completion
    onProgress({
      type: 'update',
      progress: PROGRESS.COMPLETE,
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