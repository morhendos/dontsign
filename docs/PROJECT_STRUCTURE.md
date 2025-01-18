# Project Structure

## Directory Layout

```
dontsign/
├── app/
│   ├── actions.ts              # Server actions
│   ├── api/
│   │   └── analyze/            # Analysis API endpoint
│   │       ├── route.ts
│   │       ├── chunk-analyzer.ts
│   │       └── analysis-processor.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── contract-analyzer/      # Main application components
│   │   ├── ContractAnalyzer.tsx
│   │   ├── components/
│   │   │   ├── analysis/       # Analysis-related components
│   │   │   │   ├── AnalysisResults.tsx
│   │   │   │   ├── AnalysisControls.tsx
│   │   │   │   └── AnalysisProgress.tsx
│   │   │   ├── layout/         # Layout components
│   │   │   └── upload/         # File upload components
│   │   └── hooks/
│   │       ├── state/          # State management
│   │       │   ├── useAnalyzerState.ts
│   │       │   └── useStatusManager.ts
│   │       ├── analysis/       # Analysis logic
│   │       └── storage/        # Storage management
│   └── ui/                     # Shared UI components
├── lib/
│   ├── services/
│   │   └── openai/
│   │       ├── openai-service.ts
│   │       └── prompts.ts      # AI prompts
│   ├── text-utils.ts           # Text processing utilities
│   └── errors.ts               # Error handling
├── types/                      # TypeScript type definitions
└── docs/                       # Documentation
    ├── PROJECT_STRUCTURE.md
    ├── SUMMARY_GENERATION.md
    └── TROUBLESHOOTING.md
```

## Key Components

### Contract Analysis
Main functionality for analyzing contracts is in:
- `components/contract-analyzer/`: UI components and logic
- `app/api/analyze/`: Server-side analysis
- `lib/services/openai/`: AI integration

### State Management
Application state is managed in:
- `components/contract-analyzer/hooks/state/`
- Uses React hooks pattern
- Integrates with local storage for caching

### File Processing
File handling occurs in:
- `components/contract-analyzer/components/upload/`
- `lib/text-utils.ts`
- Uses PDF.js for PDF parsing

### Analysis Results
Results display and processing:
- `components/contract-analyzer/components/analysis/`
- Uses shadcn/ui components
- Responsive layout

## Common Tasks

### Adding New Features
Place new components in appropriate directories:
1. UI Components → `components/contract-analyzer/components/`
2. Server Logic → `app/api/analyze/`
3. Shared Logic → `lib/`
4. Type Definitions → `types/`

### Modifying Analysis
Key files to modify:
1. AI Prompts → `lib/services/openai/prompts.ts`
2. Analysis Logic → `app/api/analyze/chunk-analyzer.ts`
3. Result Processing → `app/api/analyze/analysis-processor.ts`

### UI Changes
Main locations:
1. Results Display → `components/contract-analyzer/components/analysis/`
2. Upload Interface → `components/contract-analyzer/components/upload/`
3. Layout → `components/contract-analyzer/components/layout/`

## File Name Conventions

1. Components:
   - Main component files: PascalCase.tsx
   - Index files: index.tsx
   - Types: types.ts

2. Utilities:
   - Hyphenated-lowercase.ts
   - Descriptive suffixes: -utils.ts, -service.ts

3. Documentation:
   - UPPERCASE.md
   - Descriptive and specific

## Best Practices

1. **Component Organization**
   - Group related components
   - Keep components small and focused
   - Use index.ts for exports

2. **State Management**
   - Use hooks for complex state
   - Keep state close to usage
   - Document state interactions

3. **File Structure**
   - Maintain consistent naming
   - Group by feature when possible
   - Keep nesting reasonable (max 3-4 levels)

4. **Documentation**
   - Update docs with structure changes
   - Keep readme files current
   - Document complex interactions
