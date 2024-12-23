export const PROGRESS_STAGES = {
  STARTED: 2,
  FILE_READ: 5,
  PREPROCESSING: 10,
  ANALYSIS_START: 15,
  ANALYSIS_END: 85,
  SUMMARY_START: 90,
  SUMMARY_END: 95,
  COMPLETE: 100
} as const;

export type ProgressStage = keyof typeof PROGRESS_STAGES;

// Calculate progress for chunk analysis phase
export const calculateChunkProgress = (currentChunk: number, totalChunks: number): number => {
  const ANALYSIS_RANGE = PROGRESS_STAGES.ANALYSIS_END - PROGRESS_STAGES.ANALYSIS_START;
  return Math.floor(
    PROGRESS_STAGES.ANALYSIS_START + 
    (currentChunk / totalChunks) * ANALYSIS_RANGE
  );
};