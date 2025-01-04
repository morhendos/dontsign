"use server";

import * as Sentry from "@sentry/nextjs";
import { ContractAnalysisError } from "@/lib/errors";
import { splitIntoChunks } from "@/lib/text-utils";
import { openAIService } from "@/lib/services/openai/openai-service";

interface ProgressUpdate {
  type: 'progress';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  stage?: string;
  activity?: string;
}

type ProgressCallback = (data: Partial<ProgressUpdate>) => void;

export async function analyzeContract(formData: FormData, onProgress: ProgressCallback = console.log) {
  try {
    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Initial phase
    onProgress({
      type: 'progress',
      progress: 15,
      stage: 'preprocessing',
      activity: "Starting AI analysis"
    });
    await new Promise(resolve => setTimeout(resolve, 200));

    const results = [];
    const metadata = {
      analyzedAt: new Date().toISOString(),
      documentName: filename,
      modelVersion: "gpt-3.5-turbo-1106",
      totalChunks: chunks.length,
      currentChunk: 0
    };

    // Process chunks (15-80%)
    const progressPerChunk = 65 / chunks.length;
    let currentProgress = 15;

    for (let i = 0; i < chunks.length; i += 1) {
      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      metadata.currentChunk = i + 1;
      currentProgress += progressPerChunk;

      onProgress({
        type: 'progress',
        progress: Math.min(Math.round(currentProgress), 80),
        stage: 'analyzing',
        currentChunk: metadata.currentChunk,
        totalChunks: metadata.totalChunks,
        activity: `Processing section ${metadata.currentChunk} of ${metadata.totalChunks}`
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Merging phase (80-100%)
    const mergeSteps = [
      { progress: 82, activity: "Processing summaries" },
      { progress: 85, activity: "Consolidating key terms" },
      { progress: 88, activity: "Merging risk analysis" },
      { progress: 91, activity: "Reviewing clauses" },
      { progress: 94, activity: "Combining recommendations" },
      { progress: 97, activity: "Finalizing output" }
    ];

    for (const step of mergeSteps) {
      onProgress({
        type: 'progress',
        progress: step.progress,
        stage: 'analyzing',
        activity: step.activity
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Prepare final analysis
    const finalAnalysis = {
      summary: `Analysis complete. Found ${results.length} key sections.\n\n\nDetailed Analysis:\n${results.map(r => r.summary).join('\n')}`,
      keyTerms: [...new Set(results.flatMap(r => r.keyTerms))],
      potentialRisks: [...new Set(results.flatMap(r => r.potentialRisks))],
      importantClauses: [...new Set(results.flatMap(r => r.importantClauses))],
      recommendations: [...new Set(results.flatMap(r => r.recommendations || []))],
      metadata
    };

    onProgress({
      type: 'progress',
      progress: 100,
      stage: 'complete',
      activity: "Analysis complete"
    });

    return finalAnalysis;

  } catch (error) {
    console.error("Error in analyzeContract:", error);
    throw error;
  }
}