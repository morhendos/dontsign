# State Management

## Overview
The application uses React's useState and useEffect hooks for state management. The state is distributed across several custom hooks for better organization and reusability.

## Core State Components

### Analysis State
```typescript
// Current analysis state
const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
const [currentStoredAnalysis, setCurrentStoredAnalysis] = 
  useState<StoredAnalysis | null>(null);

// UI state for analysis
const [showResults, setShowResults] = useState(false);
const [hasStoredAnalyses, setHasStoredAnalyses] = useState(false);
```

### Progress State
```typescript
const [progress, setProgress] = useState(0);
const [stage, setStage] = useState<'preprocessing' | 'analyzing' | 'complete'>();
const [processingStatus, setProcessingStatus] = useState('');
```

### File State
```typescript
const [file, setFile] = useState<File | null>(null);
const [error, setError] = useState<ErrorDisplay | null>(null);
const [isProcessing, setIsProcessing] = useState(false);
```

## State Flow

### Initial Load
1. Check for stored analyses in localStorage
2. Initialize state with most recent analysis if available
3. Set up UI based on available data

### New Analysis Flow
1. File selection and validation
2. Progress updates during analysis
3. Save results to storage
4. Update UI state

### Stored Analysis Flow
1. Select analysis from history
2. Reset current file state
3. Load stored analysis
4. Show results

## Custom Hooks

### useFileHandler
- Handles file selection and validation
- Manages file processing states
- Provides reset functionality

### useContractAnalysis
- Manages analysis process
- Handles progress updates
- Controls analysis stages

### useStatusManager
- Manages status messages
- Handles timeouts for temporary messages
- Provides status update interface

## State Persistence

### Local Storage
- Stores analysis results
- Maintains history of analyses
- Handles data cleanup

### Session Management
- Reset state on page refresh
- Clear temporary data
- Maintain analysis history

## Error Handling

### State Cleanup
```typescript
const resetState = () => {
  setFile(null);
  setError(null);
  setIsProcessing(false);
  setProgress(0);
  setStage('preprocessing');
};
```

### Error States
- File validation errors
- Processing errors
- Analysis errors
- Storage errors

## Best Practices

1. **State Updates**
   - Use functional updates for dependent states
   - Batch related state updates
   - Handle race conditions

2. **Effect Dependencies**
   - Properly list effect dependencies
   - Use cleanup functions
   - Handle component unmounting

3. **Performance**
   - Memoize callbacks and values
   - Avoid unnecessary re-renders
   - Optimize state updates
