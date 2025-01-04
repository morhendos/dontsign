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
  description?: string;
}

type ProgressCallback = (data: ProgressUpdate) => void;

// Progress stages with smaller, more evenly distributed increments
const PROGRESS = {
  INIT: 5,               // Starting analysis
  VALIDATION: 10,        // Document validation
  EXTRACTION: 15,        // Content extraction
  PREPROCESSING: 20,     // Text preprocessing
  CHUNKING: 25,         // Splitting into chunks
  MODEL_INIT: 30,       // Initializing AI model
  ANALYSIS_START: 35,    // Starting analysis
  // 35-75% for chunk processing (40% total, evenly distributed)
  CHUNK_PROCESSING: 75,  
  SUMMARY: 80,          // Processing summaries
  TERMS: 85,            // Processing terms
  RISKS: 90,            // Processing risks
  RECOMMENDATIONS: 95,   // Processing recommendations
  COMPLETE: 100
} as const;

// Force minimum time for each step
const STEP_MIN_TIME = 800; // 800ms minimum per step

async function updateProgress(onProgress: ProgressCallback, data: Partial<ProgressUpdate>) {
  console.log('[Server Progress]', {
    stage: data.stage,
    progress: data.progress,
    currentChunk: data.currentChunk,
    totalChunks: data.totalChunks,
    description: data.description
  });

  onProgress({
    type: 'update',
    ...data
  });

  // Add minimum delay for UI feedback
  await new Promise(resolve => setTimeout(resolve, STEP_MIN_TIME));
}

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
    await updateProgress(onProgress, {
      progress: PROGRESS.INIT,
      stage: 'preprocessing',
      activity: "Starting analysis...",
      description: "Initializing document processing"
    });

    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    // Document validation
    await updateProgress(onProgress, {
      progress: PROGRESS.VALIDATION,
      stage: 'preprocessing',
      activity: "Validating document...",
      description: "Checking document content"
    });

    if (!text.trim()) {
      throw new ContractAnalysisError("Document appears to be empty", "INVALID_INPUT");
    }

    // Content extraction
    await updateProgress(onProgress, {
      progress: PROGRESS.EXTRACTION,
      stage: 'preprocessing',
      activity: "Extracting content...",
      description: "Reading document content"
    });

    // Text preprocessing
    await updateProgress(onProgress, {
      progress: PROGRESS.PREPROCESSING,
      stage: 'preprocessing',
      activity: "Processing text...",
      description: "Preparing content for analysis"
    });

    // Text chunking
    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    await updateProgress(onProgress, {
      progress: PROGRESS.CHUNKING,
      stage: 'preprocessing',
      activity: "Organizing content...",
      description: "Splitting into sections"
    });

    // Model initialization
    await updateProgress(onProgress, {
      progress: PROGRESS.MODEL_INIT,
      stage: 'analyzing',
      activity: "Preparing AI model...",
      description: "Initializing analysis engine",
      currentChunk: 0,
      totalChunks: chunks.length
    });

    // Start analysis
    await updateProgress(onProgress, {
      progress: PROGRESS.ANALYSIS_START,
      stage: 'analyzing',
      activity: "Starting analysis...",
      description: "Beginning document analysis",
      currentChunk: 0,
      totalChunks: chunks.length
    });

    // Process chunks with evenly distributed progress
    const results = [];
    const progressPerChunk = (PROGRESS.CHUNK_PROCESSING - PROGRESS.ANALYSIS_START) / chunks.length;
    let currentProgress = PROGRESS.ANALYSIS_START;

    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      await updateProgress(onProgress, {
        progress: Math.round(currentProgress),
        stage: 'analyzing',
        currentChunk: chunkNumber,
        totalChunks: chunks.length,
        activity: `Analyzing section ${chunkNumber} of ${chunks.length}`,
        description: `Processing section ${chunkNumber}/${chunks.length}`
      });

      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      currentProgress += progressPerChunk;
    }

    // Final processing steps
    for (const step of [
      { progress: PROGRESS.SUMMARY, activity: "Processing summaries...", description: "Combining analysis results" },
      { progress: PROGRESS.TERMS, activity: "Processing terms...", description: "Consolidating key terms" },
      { progress: PROGRESS.RISKS, activity: "Analyzing risks...", description: "Evaluating potential risks" },
      { progress: PROGRESS.RECOMMENDATIONS, activity: "Preparing recommendations...", description: "Generating final recommendations" }
    ]) {
      await updateProgress(onProgress, {
        progress: step.progress,
        stage: 'analyzing',
        activity: step.activity,
        description: step.description,
        currentChunk: chunks.length,
        totalChunks: chunks.length
      });
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
    await updateProgress(onProgress, {
      progress: PROGRESS.COMPLETE,
      stage: 'complete',
      activity: "Analysis complete!",
      description: "Preparing final results",
      currentChunk: chunks.length,
      totalChunks: chunks.length
    });

    return finalAnalysis;

  } catch (error) {
    console.error("Error in analyzeContract:", error);
    throw error;
  }
}