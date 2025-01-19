"use server";

import * as Sentry from "@sentry/nextjs";
import { ContractAnalysisError } from "@/lib/errors";
import { splitIntoChunks } from "@/lib/text-utils";
import { openAIService } from "@/lib/services/openai/openai-service";
import { promptManager } from "@/lib/services/prompts";
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

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
  const [systemPrompt, analysisPrompt] = await Promise.all([
    promptManager.getPrompt('system'),
    promptManager.getPrompt('analysis', {
      chunk,
      chunkIndex: String(chunkIndex + 1),
      totalChunks: String(totalChunks)
    })
  ]);

  const config = await promptManager.getModelConfig('analysis');
  
  const response = await openAIService.createChatCompletion({
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    response_format: config.response_format,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: analysisPrompt },
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ContractAnalysisError('No analysis generated', 'API_ERROR');
  return JSON.parse(content);
}

async function generateDocumentSummary(text: string) {
  // Take a decent amount of text from the start of the document
  const summaryText = text.slice(0, 6000);
  
  const [summaryPrompt, config] = await Promise.all([
    promptManager.getPrompt('summary'),
    promptManager.getModelConfig('summary')
  ]);

  const response = await openAIService.createChatCompletion({
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    response_format: config.response_format,
    messages: [
      { role: "user", content: `${summaryPrompt}\n\n${summaryText}` }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new ContractAnalysisError('No summary generated', 'API_ERROR');
  
  return content.trim();
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

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      throw new ContractAnalysisError("Document too short", "INVALID_INPUT");
    }

    // Generate document summary first
    await updateProgress(onProgress, {
      type: 'update',
      progress: 35,
      stage: 'analyzing',
      activity: "Generating document summary..."
    });

    const documentSummary = await generateDocumentSummary(text);

    // Start detailed analysis
    await updateProgress(onProgress, {
      type: 'update',
      progress: 45,
      stage: 'analyzing',
      activity: "Starting detailed analysis...",
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
    }

    // Results processing phase
    const finalSteps = [
      { progress: 80, activity: "Processing results..." },
      { progress: 85, activity: "Evaluating potential risks..." },
      { progress: 90, activity: "Identifying critical clauses..." },
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

    // Get config for metadata
    const config = await promptManager.getModelConfig('analysis');

    // Prepare final analysis
    const finalAnalysis = {
      summary: documentSummary,
      potentialRisks: [...new Set(results.flatMap(r => r.potentialRisks))].filter(Boolean),
      importantClauses: [...new Set(results.flatMap(r => r.importantClauses))].filter(Boolean),
      recommendations: [...new Set(results.flatMap(r => r.recommendations || []))].filter(Boolean),
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: filename,
        modelVersion: config.model,
        totalChunks: chunks.length,
        sectionsAnalyzed: chunks.length
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