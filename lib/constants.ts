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

export const progressMessages = {
  // Initialize phase
  STARTED: "Initializing document analysis system...",
  FILE_READ: "Preparing document for processing...",
  INPUT_VALIDATION: "Validating document format and content...",
  PREPROCESSING_START: "Setting up document analysis pipeline...",

  // Model initialization
  MODEL_INIT: "Loading AI analysis model...",
  MODEL_READY: "AI analysis system ready...",

  // Analysis phase
  ANALYSIS_START: "Beginning detailed contract analysis...",
  ANALYSIS_PROCESSING: "Analyzing contract structure and language...",
  ANALYSIS_MIDPOINT: "Identifying key contract elements...",
  ANALYSIS_FINALIZING: "Processing contract clauses and terms...",
  CHUNK_ANALYSIS: "Analyzing critical contract sections...",

  // Summary phase
  SUMMARY_START: "Generating comprehensive summary...",
  RISKS: "Evaluating potential risks and concerns...",
  RECOMMENDATIONS: "Preparing actionable recommendations...",
  RESULT_PREPARATION: "Finalizing analysis results...",

  COMPLETE: "Analysis complete! Preparing final report..."
} as const;

export const calculateChunkProgress = (currentChunk: number, totalChunks: number): number => {
  if (totalChunks <= 1) {
    return currentChunk === 0 ? 
      ANALYSIS_PROGRESS.ANALYSIS_START : 
      currentChunk === 1 ? 
        ANALYSIS_PROGRESS.CHUNK_ANALYSIS :
        ANALYSIS_PROGRESS.ANALYSIS_START;
  }

  const ANALYSIS_RANGE = ANALYSIS_PROGRESS.CHUNK_ANALYSIS - ANALYSIS_PROGRESS.ANALYSIS_START;
  const BASE_PROGRESS = ANALYSIS_PROGRESS.ANALYSIS_START;
  
  return Math.floor(BASE_PROGRESS + (currentChunk / totalChunks) * ANALYSIS_RANGE);
};