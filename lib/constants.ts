export const ANALYSIS_PROGRESS = {
  STARTED: 2,
  FILE_READ: 5,
  PREPROCESSING: 10,
  ANALYSIS_START: 15,
  CHUNK_ANALYSIS: 85,  // Max progress during chunk analysis
  SUMMARY_START: 90,
  SUMMARY_END: 95,
  COMPLETE: 100
} as const;

export const calculateChunkProgress = (currentChunk: number, totalChunks: number): number => {
  const ANALYSIS_RANGE = ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START;
  return Math.floor(
    ANALYSIS_PROGRESS.ANALYSIS_START + 
    (currentChunk / totalChunks) * ANALYSIS_RANGE
  );
};