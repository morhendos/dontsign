"use server";

import * as Sentry from "@sentry/nextjs";
import { ContractAnalysisError } from "@/lib/errors";
import { splitIntoChunks } from "@/lib/text-utils";
import { openAIService } from "@/lib/services/openai/openai-service";
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE, ANALYSIS_CONFIG } from "@/lib/services/openai/prompts";

interface ProgressUpdate {
  type: 'update';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  stage: string;
  activity: string;
}

type ProgressCallback = (data: ProgressUpdate) => void;

const MIN_STEP_TIME = 1000; // 1 second minimum per step

async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function updateProgress(onProgress: ProgressCallback, data: ProgressUpdate) {
  onProgress(data);
  console.log('[Server Progress]', data);
  await sleep(MIN_STEP_TIME);
}

async function analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number) {
  const response = await openAIService.createChatCompletion({
    ...ANALYSIS_CONFIG,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: USER_PROMPT_TEMPLATE(chunk, chunkIndex, totalChunks) },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ContractAnalysisError('No analysis generated', 'API_ERROR');
  return JSON.parse(content);
}

export async function analyzeContract(formData: FormData, onProgress: ProgressCallback) {
  try {
    // Input validation
    await updateProgress(onProgress, {
      type: 'update',
      progress: 5,
      stage: 'preprocessing',
      activity: "Starting analysis..."
    });

    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    await updateProgress(onProgress, {
      type: 'update',
      progress: 15,
      stage: 'preprocessing',
      activity: "Validating document..."
    });

    if (!text.trim()) {
      throw new ContractAnalysisError("Document appears to be empty", "INVALID_INPUT");
    }

    // Document preprocessing phase
    await updateProgress(onProgress, {
      type: 'update',
      progress: 25,
      stage: 'preprocessing',
      activity: "Processing document..."
    });

    await sleep(MIN_STEP_TIME); // Extra wait to show preprocessing

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Model initialization
    await updateProgress(onProgress, {
      type: 'update',
      progress: 35,
      stage: 'preprocessing',
      activity: "Preparing AI model..."
    });

    await sleep(MIN_STEP_TIME); // Extra wait for model init

    await updateProgress(onProgress, {
      type: 'update',
      progress: 45,
      stage: 'analyzing',
      activity: "Starting document analysis...",
      currentChunk: 0,
      totalChunks: chunks.length
    });

    // Chunk analysis phase - spread between 45% and 75%
    const results = [];
    const progressPerChunk = (75 - 45) / chunks.length;
    let currentProgress = 45;

    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      await updateProgress(onProgress, {
        type: 'update',
        progress: Math.round(currentProgress),
        stage: 'analyzing',
        activity: `Analyzing section ${chunkNumber} of ${chunks.length}`,
        currentChunk: chunkNumber,
        totalChunks: chunks.length
      });

      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      currentProgress += progressPerChunk;

      // Small delay after each chunk
      await sleep(500);
    }

    // Results processing phase
    const finalSteps = [
      { progress: 80, activity: "Processing section summaries..." },
      { progress: 85, activity: "Analyzing key terms..." },
      { progress: 90, activity: "Evaluating potential risks..." },
      { progress: 95, activity: "Preparing recommendations..." }
    ];

    for (const step of finalSteps) {
      await updateProgress(onProgress, {
        type: 'update',
        progress: step.progress,
        stage: 'analyzing',
        activity: step.activity,
        currentChunk: chunks.length,
        totalChunks: chunks.length
      });
    }

    // Prepare final analysis
    const finalAnalysis = {
      summary: `Analysis complete. Found ${results.length} key sections.\n\n${results.map(r => r.summary).join('\n')}`,
      keyTerms: [...new Set(results.flatMap(r => r.keyTerms))].filter(Boolean),
      potentialRisks: [...new Set(results.flatMap(r => r.potentialRisks))].filter(Boolean),
      importantClauses: [...new Set(results.flatMap(r => r.importantClauses))].filter(Boolean),
      recommendations: [...new Set(results.flatMap(r => r.recommendations || []))].filter(Boolean),
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: filename,
        modelVersion: ANALYSIS_CONFIG.model,
        totalChunks: chunks.length,
        currentChunk: chunks.length
      }
    };

    // Complete
    await updateProgress(onProgress, {
      type: 'update',
      progress: 100,
      stage: 'complete',
      activity: "Analysis complete!",
      currentChunk: chunks.length,
      totalChunks: chunks.length
    });

    return finalAnalysis;

  } catch (error) {
    console.error("Error in analyzeContract:", error);
    throw error;
  }
}