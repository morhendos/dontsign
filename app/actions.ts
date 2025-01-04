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
  stage: string;
  activity: string;  // User-facing message
}

type ProgressCallback = (data: ProgressUpdate) => void;

// Predefined progress steps for consistent updates
const STEPS = [
  { progress: 5, stage: 'preprocessing', activity: "Starting document analysis..." },
  { progress: 10, stage: 'preprocessing', activity: "Validating document..." },
  { progress: 15, stage: 'preprocessing', activity: "Processing document content..." },
  { progress: 20, stage: 'preprocessing', activity: "Preparing for analysis..." },
  { progress: 25, stage: 'preprocessing', activity: "Organizing document sections..." },
  { progress: 30, stage: 'preprocessing', activity: "Setting up AI model..." },
  { progress: 35, stage: 'analyzing', activity: "Initializing document analysis..." },
] as const;

const FINAL_STEPS = [
  { progress: 80, stage: 'analyzing', activity: "Processing document summaries..." },
  { progress: 85, stage: 'analyzing', activity: "Analyzing key terms..." },
  { progress: 90, stage: 'analyzing', activity: "Evaluating potential risks..." },
  { progress: 95, stage: 'analyzing', activity: "Preparing recommendations..." },
] as const;

// Force minimum time between updates
const STEP_MIN_TIME = 800;

async function updateProgress(onProgress: ProgressCallback, data: ProgressUpdate) {
  // Log exactly what we're sending to the UI
  console.log('[Server Progress]', data);
  
  onProgress(data);
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
    // Initial steps
    for (const step of STEPS) {
      await updateProgress(onProgress, {
        type: 'update',
        ...step
      });
    }

    // Validate input
    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    if (!text.trim()) {
      throw new ContractAnalysisError("Document appears to be empty", "INVALID_INPUT");
    }

    // Process document
    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Process chunks
    const results = [];
    const progressPerChunk = (80 - 35) / chunks.length; // 35-80% for chunks
    let currentProgress = 35;

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
    }

    // Final processing steps
    for (const step of FINAL_STEPS) {
      await updateProgress(onProgress, {
        type: 'update',
        ...step,
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