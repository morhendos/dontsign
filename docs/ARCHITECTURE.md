# DontSign Architecture Overview

## Core Architecture

DontSign is a Next.js 14 application that analyzes contracts using AI. The application follows a modular architecture with clear separation of concerns:

```
├── app/                        # Next.js app directory
│   ├── actions.ts              # Server actions for GPT analysis
│   ├── api/                    # API routes
│   └── page.tsx                # Main entry page
│
├── components/                 # React components
│   ├── contract-analyzer/      # Main analyzer functionality
│   │   ├── components/         # Sub-components
│   │   ├── hooks/             # Custom hooks for state & logic
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── analysis-history/       # History visualization
│   ├── analysis-log/          # Analysis progress logging
│   └── ui/                    # Shared UI components
│
└── lib/                       # Shared utilities
    ├── services/              # External service integrations
    ├── errors.ts              # Error handling
    ├── storage.ts             # Local storage management
    └── text-utils.ts          # Text processing utilities
```

## Key Components

### ContractAnalyzer
Main component orchestrating the analysis workflow. It handles:
- File selection and validation
- Analysis state management
- Results display coordination
- History management

### Custom Hooks

#### useContractAnalyzer
Topmost state management hook that:
- Coordinates between different state slices
- Handles file selection and analysis
- Manages results visibility
- Coordinates with history

#### useAnalyzerState
Core state management for:
- File processing state
- Analysis progress
- Results management
- Status updates

#### useProcessingState
Manages file processing workflow:
- Tracks current processing stage
- Handles processing errors
- Manages processing progress

#### useStatusManager
Coordinates status updates across components:
- Centralizes status management
- Provides consistent status updates
- Handles status transitions

#### useAnalysisHistory
Manages historical analysis data:
- Stores analysis results
- Handles retrieval and updates
- Manages timestamps and ordering

## State Management

The application uses a hierarchical state management approach:

1. Top Level (`useContractAnalyzer`)
   - Coordinates all state interactions
   - Handles user actions
   - Controls results visibility

2. Analysis State (`useAnalyzerState`)
   - Manages file processing
   - Tracks analysis progress
   - Handles error states

3. Processing State (`useProcessingState`)
   - File processing workflow
   - Progress tracking
   - Error management

4. Status Management (`useStatusManager`)
   - Global status coordination
   - Status transitions
   - User feedback

5. UI State
   - Results visibility
   - Progress indicators
   - User feedback

## Data Flow

1. File Selection
   ```
   User -> ContractAnalyzer -> useContractAnalyzer -> useAnalyzerState
   ```

2. Analysis Process
   ```
   Server Action -> Analysis Progress -> State Updates -> UI Updates
   ```

3. Results Management
   ```
   Analysis Complete -> State Update -> Results Display -> History Storage
   ```

## Reliability Patterns

### Circuit Breaker
Implemented for OpenAI API calls to prevent cascading failures:
- Automatic failure detection
- Graceful degradation
- Self-healing capability
- Exponential backoff

Configuration:
```typescript
const breaker = new CircuitBreaker({
  failureThreshold: 5,    // Number of failures before opening
  resetTimeout: 30000     // Maximum timeout (30 seconds)
});
```

States:
- CLOSED: Normal operation
- OPEN: Preventing calls after failures
- HALF-OPEN: Testing recovery

## Key Features

### Analysis Deduplication
- Files are hashed for identification
- Previous analyses are cached and reused
- State is properly managed between analyses

### History Management
- Analyses are stored with metadata
- Quick access to previous results
- Proper state cleanup between selections

### Error Handling
- Comprehensive error types
- User-friendly error messages
- Proper state recovery
- Circuit breaker pattern for API calls

## Best Practices

1. **State Management**
   - Use refs for values that shouldn't trigger re-renders
   - Keep state updates atomic and predictable
   - Clear state properly between operations

2. **File Handling**
   - Always verify file content before processing
   - Clean up resources after processing
   - Handle large files efficiently

3. **UI Updates**
   - Show clear progress indicators
   - Provide immediate feedback
   - Handle state transitions smoothly

## Adding New Features

When adding new features:

1. Create relevant hooks in appropriate directories
2. Add types to support new functionality
3. Update state management if needed
4. Add proper error handling
5. Update documentation

## Common Issues

### State Management
- Always reset state when selecting new files
- Clear results properly between analyses
- Handle race conditions in async operations

### File Processing
- Handle large files properly
- Verify file content before processing
- Clean up resources after use

### History Management
- Update timestamps properly
- Handle storage limits
- Clear old entries when needed

### API Reliability
- Monitor circuit breaker metrics
- Handle API rate limits
- Implement proper backoff strategies
