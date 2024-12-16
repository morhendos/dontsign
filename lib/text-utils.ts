import { ContractAnalysisError } from './errors';

interface ChunkingOptions {
  maxChunkSize?: number;
  overlap?: number;
}

export function splitIntoChunks(text: string, options: ChunkingOptions = {}): string[] {
  try {
    if (!text || typeof text !== 'string') {
      throw new ContractAnalysisError(
        'Invalid input: text must be a non-empty string',
        'TEXT_PROCESSING_ERROR'
      );
    }

    const {
      maxChunkSize = 4000,  // Approx 4000 tokens
      overlap = 200         // Overlap between chunks
    } = options;

    // First, split by common section markers
    const sectionMarkers = /\b(ARTICLE|SECTION|CLAUSE|\d+\.|[A-Z]\.)\s+/g;
    let sections = text.split(sectionMarkers).filter(Boolean);

    if (!Array.isArray(sections)) {
      sections = [text]; // Fallback to treating the entire text as one section
    }

    const chunks: string[] = [];
    let currentChunk = '';
    let currentSize = 0;

    for (const section of sections) {
      // Rough token estimation (4 chars = ~1 token)
      const sectionSize = Math.ceil((section?.length || 0) / 4);

      if (currentSize + sectionSize > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // If a single section is too large, split it into smaller pieces
        if (sectionSize > maxChunkSize) {
          const splitSections = splitLargeSection(section, maxChunkSize, overlap);
          chunks.push(...splitSections);
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

    // Validate the result
    if (!Array.isArray(chunks) || chunks.length === 0) {
      throw new ContractAnalysisError(
        'Text chunking produced no valid chunks',
        'TEXT_PROCESSING_ERROR'
      );
    }

    return chunks;
  } catch (error) {
    if (error instanceof ContractAnalysisError) {
      throw error;
    }
    throw new ContractAnalysisError(
      'Failed to split text into chunks',
      'TEXT_PROCESSING_ERROR',
      error
    );
  }
}

function splitLargeSection(section: string, maxSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  const sentences = section.match(/[^.!?]+[.!?]+/g) || [section];
  let currentChunk = '';
  let currentSize = 0;

  for (const sentence of sentences) {
    const sentenceSize = Math.ceil(sentence.length / 4);
    
    if (currentSize + sentenceSize > maxSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        // Add overlap by keeping some content from the end of the previous chunk
        currentChunk = currentChunk.slice(-overlap) + sentence;
        currentSize = Math.ceil(currentChunk.length / 4);
      } else {
        // If a single sentence is too large, force split it
        chunks.push(sentence.trim());
      }
    } else {
      currentChunk += sentence;
      currentSize += sentenceSize;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
