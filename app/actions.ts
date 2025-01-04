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

// Force minimum time for phases to prevent jumps
const PHASE_MIN_TIME = 2000; // 2 seconds minimum per phase

// Add small random delay to make progress feel more natural
const addNaturalDelay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 500 + 500)
);

async function updateProgress(onProgress: ProgressCallback, data: Partial<ProgressUpdate>, minDelay = PHASE_MIN_TIME) {
  onProgress({
    type: 'update',
    ...data
  });
  await new Promise(resolve => setTimeout(resolve, minDelay));
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
    // Phase 1: Document Loading (0-15%)
    await updateProgress(onProgress, {
      progress: 5,
      stage: 'preprocessing',
      activity: "Loading document...",
      description: "Starting analysis process"
    });

    const text = formData.get("text");
    const filename = formData.get("filename");
    if (!text || typeof text !== 'string' || !filename || typeof filename !== 'string') {
      throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
    }

    if (!text.trim()) {
      throw new ContractAnalysisError("Document appears to be empty", "INVALID_INPUT");
    }

    await addNaturalDelay();
    
    // Phase 2: Document Preprocessing (15-35%)
    await updateProgress(onProgress, {
      progress: 15,
      stage: 'preprocessing',
      activity: "Processing document...",
      description: "Analyzing document structure"
    });

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    await addNaturalDelay();
    
    await updateProgress(onProgress, {
      progress: 25,
      stage: 'preprocessing',
      activity: "Preparing document...",
      description: "Organizing content for analysis"
    });

    await addNaturalDelay();

    // Phase 3: AI Model Initialization (35-50%)
    await updateProgress(onProgress, {
      progress: 35,
      stage: 'analyzing',
      activity: "Initializing AI analysis...",
      description: "Setting up analysis engine",
      currentChunk: 0,
      totalChunks: chunks.length
    });

    await addNaturalDelay();

    // Phase 4: Content Analysis (50-80%)
    const results = [];
    const progressPerChunk = 30 / chunks.length; // 30% total for chunks
    let currentProgress = 50;

    for (let i = 0; i < chunks.length; i++) {
      const chunkNumber = i + 1;
      
      await updateProgress(onProgress, {
        progress: Math.round(currentProgress),
        stage: 'analyzing',
        currentChunk: chunkNumber,
        totalChunks: chunks.length,
        activity: `Analyzing section ${chunkNumber} of ${chunks.length}`,
        description: `Processing document section ${chunkNumber}`
      }, 1000);

      results.push(await analyzeChunk(chunks[i], i, chunks.length));
      currentProgress += progressPerChunk;
      
      await addNaturalDelay();
    }

    // Phase 5: Final Processing (80-100%)
    const finalSteps = [
      { progress: 85, activity: "Processing summaries...", description: "Combining section analyses" },
      { progress: 90, activity: "Analyzing terms...", description: "Consolidating key terms" },
      { progress: 95, activity: "Finalizing...", description: "Preparing recommendations" }
    ];

    for (const step of finalSteps) {
      await updateProgress(onProgress, {
        ...step,
        stage: 'analyzing',
        currentChunk: chunks.length,
        totalChunks: chunks.length
      });
      await addNaturalDelay();
    }

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
      activity: "Analysis complete!",
      description: "Preparing final results",
      currentChunk: chunks.length,
      totalChunks: chunks.length
    }, 1000);

    return finalAnalysis;

  } catch (error) {
    console.error("Error in analyzeContract:", error);
    throw error;
  }
}