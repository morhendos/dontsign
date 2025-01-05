# Analysis History Feature

## Overview
The Analysis History feature allows users to access and review their previous contract analyses. Analyses are stored locally in the browser's localStorage and persist across page reloads.

## Technical Implementation

### Storage
- Analyses are stored in localStorage under `dontsign_analyses` key
- Maximum of 10 most recent analyses are kept
- Each analysis includes:
  - Unique ID
  - File name
  - Analysis results
  - Timestamp

### State Management
```typescript
// Initial state loading
useEffect(() => {
  const analyses = getStoredAnalyses();
  setHasStoredAnalyses(analyses.length > 0);
  if (analyses.length > 0) {
    setCurrentStoredAnalysis(analyses[0]);
  }
}, []);
```

### Data Structure
```typescript
interface StoredAnalysis {
  id: string;
  fileName: string;
  analysis: AnalysisResult;
  analyzedAt: string;
}
```

## User Interface

### Controls
- "View Latest Analysis" - Shows the most recent analysis
- "Previous Analyses" - Opens a modal with all stored analyses

### History Modal
- Displays list of previous analyses with timestamps
- Delete functionality for individual analyses
- Click to view any stored analysis

## State Transitions

1. **On Page Load**
   - Load stored analyses from localStorage
   - Initialize with most recent analysis if available

2. **On New Analysis**
   - Save to localStorage
   - Update current analysis state
   - Add to history list

3. **Viewing Stored Analysis**
   - Reset current file state
   - Load stored analysis data
   - Show analysis results

## Error Handling

- Graceful degradation if localStorage is unavailable
- Proper state cleanup when deleting analyses
- Validation of stored data structure
