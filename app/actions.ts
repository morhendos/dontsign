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

// Ensure minimum visual feedback time for small files
const MIN_PROGRESS_TIME = 800; // Minimum time in ms for each progress step

async function updateProgress(onProgress: ProgressCallback, data: Partial<ProgressUpdate>) {
  onProgress({
    type: 'update',
    ...data
  });
  // Add small delay for UI feedback
  await new Promise(resolve => setTimeout(resolve, MIN_PROGRESS_TIME));
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
    // Document Validation Phase (0-25%)
    await updateProgress(onProgress, {
      progress: 2,
      stage: 'preprocessing',
      activity: "Starting document validation",
      description: "Initializing document processing"
    });

    // Validate input
    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    await updateProgress(onProgress, {
      progress: 5,
      stage: 'preprocessing',
      activity: "Reading document content",
      description: "Validating document format"
    });

    if (!text.trim()) {
      throw new ContractAnalysisError("Document appears to be empty", "INVALID_INPUT");
    }

    await updateProgress(onProgress, {
      progress: 10,
      stage: 'preprocessing',
      activity: "Processing document structure",
      description: "Analyzing document format"
    });

    // Text Processing Phase (25-50%)
    await updateProgress(onProgress, {
      progress: 25,
      stage: 'preprocessing',
      activity: "Preparing for analysis",
      description: "Splitting document into sections"
    });

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    await updateProgress(onProgress, {
      progress: 35,
      stage: 'analyzing',
      activity: "Document preparation complete",
      description: "Starting AI analysis",
      currentChunk: 0,
      totalChunks: chunks.length
    });

    // AI Analysis Phase (50-75%)
    const results = [];
    const progressPerChunk = 25 / chunks.length; // 25% total for chunks
    let currentProgress = 50;

    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      await updateProgress(onProgress, {
        progress: Math.round(currentProgress),
        stage: 'analyzing',
        currentChunk: chunkNumber,
        totalChunks: chunks.length,
        activity: `Processing section ${chunkNumber}`,
        description: `Analyzing section ${chunkNumber} of ${chunks.length}`
      });

      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      currentProgress += progressPerChunk;
    }

    // Final Processing Phase (75-100%)
    const finalSteps = [
      { progress: 80, activity: "Processing summaries", description: "Consolidating section analyses" },
      { progress: 85, activity: "Analyzing terms", description: "Processing important terms and definitions" },
      { progress: 90, activity: "Checking risks", description: "Evaluating potential risks and concerns" },
      { progress: 95, activity: "Finalizing", description: "Preparing final recommendations" }
    ];

    for (const step of finalSteps) {
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
      progress: 100,
      stage: 'complete',
      activity: "Analysis complete",
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
