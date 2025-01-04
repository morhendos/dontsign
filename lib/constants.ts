export const ANALYSIS_PROGRESS = {
  // Initialize phase (0-10%)
  STARTED: 2,
  FILE_READ: 5,
  INPUT_VALIDATION: 10,

  // Preprocessing phase (10-30%)
  PREPROCESSING_START: 15,
  TEXT_EXTRACTION: 20,
  PREPROCESSING_COMPLETE: 25,
  
  // Model initialization (30-40%)
  MODEL_INIT: 30,
  MODEL_READY: 35,
  
  // Analysis phase (40-70%, split into chunks)
  ANALYSIS_START: 40,
  CHUNK_ANALYSIS: 70,
  
  // Summary phase (70-90%)
  SUMMARY_START: 75,
  KEY_TERMS: 80,
  RISKS: 85,
  RECOMMENDATIONS: 90,
  
  // Finalization (90-100%)
  RESULT_PREPARATION: 95,
  COMPLETE: 100
} as const;

export const calculateChunkProgress = (currentChunk: number, totalChunks: number): number => {
  // Calculate progress within chunk analysis phase (40-70%)
  const ANALYSIS_RANGE = ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START;
  const progress = Math.floor(
    ANALYSIS_PROGRESS.ANALYSIS_START + 
    (currentChunk / totalChunks) * ANALYSIS_RANGE
  );

  // Add small random variance to make progress feel more natural
  const variance = Math.random() * 2 - 1; // -1 to +1
  return Math.min(Math.max(progress + variance, ANALYSIS_PROGRESS.ANALYSIS_START), ANALYSIS_PROGRESS.CHUNK_ANALYSIS);
};