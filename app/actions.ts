"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  totalChunks?: number;
}

// Add retry logic for API failures
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error("Max retry attempts reached");
}

// Simple rate limiting implementation
const rateLimiter = new Map<string, number>();
function checkRateLimit(userId: string, limit = 10): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || 0;
  if (userRequests >= limit) return false;
  rateLimiter.set(userId, userRequests + 1);
  setTimeout(() => rateLimiter.set(userId, userRequests), 3600000); // Reset after 1 hour
  return true;
}

// Function to split text into chunks
function splitIntoChunks(text: string): string[] {
  // Maximum size for each chunk (approximately 4000 tokens to leave room for prompt and completion)
  const MAX_CHUNK_SIZE = 4000;
  
  // First, split by common section markers
  const sectionMarkers = /\b(ARTICLE|SECTION|CLAUSE|\d+\.|[A-Z]\.)\s+/g;
  let sections = text.split(sectionMarkers).filter(section => section.trim());

  const chunks: string[] = [];
  let currentChunk = '';
  let currentSize = 0;

  for (const section of sections) {
    // Rough token estimation (4 chars = ~1 token)
    const sectionSize = Math.ceil(section.length / 4);

    if (currentSize + sectionSize > MAX_CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If a single section is too large, split it into smaller pieces
      if (sectionSize > MAX_CHUNK_SIZE) {
        const sentences = section.match(/[^.!?]+[.!?]+/g) || [section];
        let tempChunk = '';
        let tempSize = 0;

        for (const sentence of sentences) {
          const sentenceSize = Math.ceil(sentence.length / 4);
          if (tempSize + sentenceSize > MAX_CHUNK_SIZE) {
            if (tempChunk) {
              chunks.push(tempChunk.trim());
            }
            tempChunk = sentence;
            tempSize = sentenceSize;
          } else {
            tempChunk += sentence;
            tempSize += sentenceSize;
          }
        }
        if (tempChunk) {
          chunks.push(tempChunk.trim());
        }
      } else {
        currentChunk = section;
        currentSize = sectionSize;
      }
    } else {
      currentChunk += section;
      currentSize += sectionSize;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Function to analyze a single chunk
async function analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number): Promise<AnalysisResult> {
  const systemPrompt = "You are a legal expert. Analyze this contract section concisely.";

  const userPrompt = `Section ${chunkIndex + 1}/${totalChunks}:\n${chunk}\n\nProvide JSON with: summary (brief), keyTerms, potentialRisks, importantClauses, recommendations.`;

  const response = await withRetry(async () => {
    return await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });
  });

  if (!response?.choices[0]?.message?.content) {
    throw new Error("No analysis generated");
  }

  return JSON.parse(response.choices[0].message.content);
}

// Function to summarize the entire contract
async function generateOverallSummary(results: AnalysisResult[]): Promise<string> {
  // Prepare a concise summary of key points
  const keyPoints = results
    .map(r => r.summary)
    .join("\n")
    .slice(0, 6000); // Limit input size
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: "Provide a concise contract summary."
      },
      {
        role: "user",
        content: `Summarize these contract sections:\n${keyPoints}`
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  return response.choices[0].message.content || "";
}

// Function to merge multiple analysis results
function mergeAnalysisResults(results: AnalysisResult[]): AnalysisResult {
  const merged: AnalysisResult = {
    summary: "", // Will be set by generateOverallSummary
    keyTerms: [],
    potentialRisks: [],
    importantClauses: [],
    recommendations: [],
  };

  // Merge all arrays
  for (const result of results) {
    if (result.keyTerms) merged.keyTerms.push(...result.keyTerms);
    if (result.potentialRisks) merged.potentialRisks.push(...result.potentialRisks);
    if (result.importantClauses) merged.importantClauses.push(...result.importantClauses);
    if (result.recommendations) merged.recommendations?.push(...result.recommendations);
  }

  // Remove duplicates using exact matching (for performance)
  merged.keyTerms = Array.from(new Set(merged.keyTerms));
  merged.potentialRisks = Array.from(new Set(merged.potentialRisks));
  merged.importantClauses = Array.from(new Set(merged.importantClauses));
  if (merged.recommendations) {
    merged.recommendations = Array.from(new Set(merged.recommendations));
  }

  return merged;
}

export async function analyzeContract(formData: FormData) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Please contact the administrator."
    );
  }

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  let fileContent: string;
  try {
    fileContent = await file.text();
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error("Failed to read file content");
  }

  if (!fileContent?.trim()) throw new Error("File content is empty");

  try {
    // Split the content into manageable chunks
    const chunks = splitIntoChunks(fileContent);
    console.log(`Split contract into ${chunks.length} chunks`);
    
    // Analyze each chunk
    const analysisResults = await Promise.all(
      chunks.map((chunk, index) => analyzeChunk(chunk, index, chunks.length))
    );

    // Merge the results
    const mergedAnalysis = mergeAnalysisResults(analysisResults);

    // Generate overall summary
    mergedAnalysis.summary = await generateOverallSummary(analysisResults);

    // Add metadata
    return {
      ...mergedAnalysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        documentName: file.name,
        modelVersion: "gpt-3.5-turbo-1106",
        totalChunks: chunks.length
      } as AnalysisMetadata,
    };
  } catch (error) {
    console.error("Error generating analysis:", error);
    throw new Error(
      `Failed to analyze contract: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}