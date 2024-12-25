"use server";

import * as Sentry from "@sentry/nextjs";
import { ContractAnalysisError } from "@/lib/errors";
import { splitIntoChunks } from "@/lib/text-utils";
import { openAIService } from "@/lib/services/openai/openai-service";

interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
}

interface AnalysisMetadata {
  analyzedAt: string;
  documentName: string;
  modelVersion: string;
  totalChunks: number;
  currentChunk: number;
}

const BATCH_SIZE = 3;

interface ProgressUpdate {
  type: 'progress';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  stage?: string;
  activity?: string;
}

async function emitProgress(update: Partial<ProgressUpdate>) {
  console.log(JSON.stringify({
    type: 'progress',
    ...update,
    stage: update.progress && update.progress >= 100 ? 'complete' : 
          update.progress && update.progress <= 15 ? 'preprocessing' : 'analyzing'
  }));
}

async function analyzeContract(formData: FormData) {
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

    await emitProgress({ progress: 15, activity: 'Starting AI analysis' });

    const results: AnalysisResult[] = [];
    const metadata: AnalysisMetadata = {
      analyzedAt: new Date().toISOString(),
      documentName: filename,
      modelVersion: "gpt-3.5-turbo-1106",
      totalChunks: chunks.length,
      currentChunk: 0
    };

    // Distribute 15-80% for chunk analysis
    const progressPerChunk = 65 / chunks.length;
    let currentProgress = 15;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batchChunks.map((chunk, idx) => analyzeChunk(chunk, i + idx, chunks.length))
      );
      
      results.push(...batchResults);
      metadata.currentChunk = Math.min(i + BATCH_SIZE, chunks.length);
      currentProgress += progressPerChunk * batchChunks.length;
      
      await emitProgress({
        progress: Math.min(Math.round(currentProgress), 80),
        currentChunk: metadata.currentChunk,
        totalChunks: metadata.totalChunks,
        activity: 'Processing contract sections'
      });
    }

    // Merge phase (80-100%)
    await emitProgress({ 
      progress: 82, 
      activity: 'Starting to merge analysis results' 
    });

    // Combine summaries
    const aiSummaries = results.map(r => r.summary).join('\n');
    await emitProgress({ 
      progress: 85, 
      activity: 'Merging section summaries' 
    });

    // Deduplicate key terms
    const keyTerms = [...new Set(results.flatMap(r => r.keyTerms))];
    await emitProgress({ 
      progress: 88, 
      activity: 'Processing key terms' 
    });

    // Deduplicate risks
    const potentialRisks = [...new Set(results.flatMap(r => r.potentialRisks))];
    await emitProgress({ 
      progress: 91, 
      activity: 'Processing risk analysis' 
    });

    // Deduplicate clauses
    const importantClauses = [...new Set(results.flatMap(r => r.importantClauses))];
    await emitProgress({ 
      progress: 94, 
      activity: 'Processing important clauses' 
    });

    // Deduplicate recommendations
    const recommendations = [...new Set(results.flatMap(r => r.recommendations || []))];
    await emitProgress({ 
      progress: 97, 
      activity: 'Finalizing recommendations' 
    });

    const finalAnalysis = {
      summary: `Analysis complete. Found ${results.length} key sections.\n\n\nDetailed Analysis:\n${aiSummaries}`,
      keyTerms,
      potentialRisks,
      importantClauses,
      recommendations,
      metadata
    };

    await emitProgress({ 
      progress: 100,
      activity: 'Analysis complete' 
    });

    return finalAnalysis;

  } catch (error) {
    console.error("Error in analyzeContract:", error);
    throw error;
  }
}