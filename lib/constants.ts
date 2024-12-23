export const ANALYSIS_PROGRESS = {
  STARTED: 2,
  FILE_READ: 5,
  PREPROCESSING: 10,
  ANALYSIS_START: 15,
  CHUNK_ANALYSIS: 70,  // Reduced to leave room for final steps
  SUMMARY_START: 75,
  SUMMARY_GENERATION: 85,
  RESULT_PREPARATION: 95,
  COMPLETE: 100
} as const;

export const calculateChunkProgress = (currentChunk: number, totalChunks: number): number => {
  // Calculate progress within chunk analysis phase (15-70%)
  const ANALYSIS_RANGE = ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START;
  return Math.floor(
    ANALYSIS_PROGRESS.ANALYSIS_START + 
    (currentChunk / totalChunks) * ANALYSIS_RANGE
  );
};