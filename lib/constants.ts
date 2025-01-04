export const ANALYSIS_PROGRESS = {
  // Initialize phase (0-15%)
  STARTED: 2,
  FILE_READ: 5,
  INPUT_VALIDATION: 10,
  PREPROCESSING_START: 15,

  // Model initialization (15-30%)
  MODEL_INIT: 20,
  MODEL_READY: 30,
  
  // Analysis phase (30-80%, better distribution)
  ANALYSIS_START: 30,
  ANALYSIS_PROCESSING: 40,
  ANALYSIS_MIDPOINT: 50,
  ANALYSIS_FINALIZING: 60,
  CHUNK_ANALYSIS: 70,
  
  // Summary phase (80-95%)
  SUMMARY_START: 80,
  RISKS: 85,
  RECOMMENDATIONS: 90,
  RESULT_PREPARATION: 95,
  
  COMPLETE: 100
} as const;

export const calculateChunkProgress = (currentChunk: number, totalChunks: number): number => {
  if (totalChunks <= 1) {
    // For single chunk, use predefined steps
    return currentChunk === 0 ? 
      ANALYSIS_PROGRESS.ANALYSIS_START : 
      currentChunk === 1 ? 
        ANALYSIS_PROGRESS.CHUNK_ANALYSIS :
        ANALYSIS_PROGRESS.ANALYSIS_START;
  }

  // For multiple chunks, calculate smooth progress
  const ANALYSIS_RANGE = ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START;
  const BASE_PROGRESS = ANALYSIS_PROGRESS.ANALYSIS_START;
  
  // Calculate exact progress within the range
  return Math.floor(BASE_PROGRESS + (currentChunk / totalChunks) * ANALYSIS_RANGE);
};