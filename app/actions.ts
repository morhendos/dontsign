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
function splitIntoChunks(text: string, maxChunkSize: number = 6000): string[] {
  // First, split by common section markers
  const sectionMarkers = /\b(ARTICLE|SECTION|CLAUSE|\d+\.|[A-Z]\.)\s+/g;
  let sections = text.split(sectionMarkers);

  // If sections are still too large, split them further
  const chunks: string[] = [];
  for (const section of sections) {
    if (!section.trim()) continue;

    const words = section.split(/\s+/);
    let currentChunk: string[] = [];
    let currentChunkSize = 0;

    for (const word of words) {
      // Approximate token count (rough estimate: 4 characters = 1 token)
      const wordTokens = Math.ceil((word.length + 1) / 4);
      
      if (currentChunkSize + wordTokens > maxChunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [];
          currentChunkSize = 0;
        }
      }
      currentChunk.push(word);
      currentChunkSize += wordTokens;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }
  }

  return chunks;
}

// Function to analyze a single chunk
async function analyzeChunk(chunk: string, chunkIndex: number, totalChunks: number): Promise<AnalysisResult> {
  const systemPrompt = "You are an expert legal document analyzer.";

  const userPrompt = `Analyze this contract section (part ${chunkIndex + 1} of ${totalChunks}) focusing on risks and key terms.

Content:
${chunk}

Provide ONLY a JSON response with:
- summary (2-3 sentences for this section)
- keyTerms (important terms)
- potentialRisks (risks identified)
- importantClauses (critical clauses)
- recommendations (suggested actions)`;

  const response = await withRetry(async () => {
    return await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
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
  const keyPoints = results.map(r => r.summary).join("\n");
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: "You are an expert legal document analyzer. Provide a concise summary."
      },
      {
        role: "user",
        content: `Based on these section summaries, provide a concise overall summary of the contract:\n${keyPoints}`
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

  for (const result of results) {
    merged.keyTerms.push(...(result.keyTerms || []));
    merged.potentialRisks.push(...(result.potentialRisks || []));
    merged.importantClauses.push(...(result.importantClauses || []));
    if (result.recommendations) {
      merged.recommendations?.push(...result.recommendations);
    }
  }

  // Remove duplicates and near-duplicates
  const similarityThreshold = 0.8;
  const dedupeArray = (arr: string[]) => {
    return arr.filter((item, index) => {
      return !arr.slice(0, index).some(prevItem => {
        const similarity = compareSimilarity(item, prevItem);
        return similarity > similarityThreshold;
      });
    });
  };

  merged.keyTerms = dedupeArray(merged.keyTerms);
  merged.potentialRisks = dedupeArray(merged.potentialRisks);
  merged.importantClauses = dedupeArray(merged.importantClauses);
  if (merged.recommendations) {
    merged.recommendations = dedupeArray(merged.recommendations);
  }

  return merged;
}

// Helper function to compare string similarity (Levenshtein distance based)
function compareSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

// Helper function to calculate Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        );
      }
    }
  }

  return matrix[str1.length][str2.length];
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