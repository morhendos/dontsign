import type { AnalysisResult } from '@/types/analysis';

export interface StoredAnalysis {
  id: string;
  fileName: string;
  analysis: AnalysisResult;
  analyzedAt: string;
}

const STORAGE_KEY = 'dontsign_analyses';

export function saveAnalysis(fileName: string, analysis: AnalysisResult): StoredAnalysis {
  try {
    // Get existing analyses
    const analyses = getStoredAnalyses();
    
    // Create new analysis entry
    const newAnalysis: StoredAnalysis = {
      id: generateId(),
      fileName,
      analysis,
      analyzedAt: new Date().toISOString()
    };

    // Add to beginning of array (most recent first)
    analyses.unshift(newAnalysis);

    // Keep only last 10 analyses
    const trimmedAnalyses = analyses.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedAnalyses));

    return newAnalysis;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
}

export function getStoredAnalyses(): StoredAnalysis[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting stored analyses:', error);
    return [];
  }
}

export function deleteAnalysis(id: string): void {
  try {
    const analyses = getStoredAnalyses();
    const filtered = analyses.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
