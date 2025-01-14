# DontSign - Contract Analysis Application

## Project Overview
DontSign is a web application that helps users analyze contracts using AI. It processes PDF and DOCX files, extracting text and using OpenAI's GPT API to provide detailed analysis including key terms, potential risks, and recommendations.

## Technical Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- OpenAI API (GPT-3.5-turbo-1106)
- PDF.js for PDF parsing
- Sentry for error tracking
- Local storage for analysis history

## Project Structure

### `/app`
Next.js 14 app directory:
- `page.tsx` - Main landing page
- `layout.tsx` - Root layout with theme provider
- `actions.ts` - Server actions for contract analysis
- Route pages for `/contact`, `/privacy`, `/terms`

### `/components`

#### `contract-analyzer/`
Core analysis functionality:
- `ContractAnalyzer.tsx` - Main orchestration component
- `/components`
  - `analysis/` - Analysis UI components (progress, results, controls)
  - `layout/` - Layout components
  - `upload/` - File upload handling
- `/hooks`
  - `useContractAnalyzer.ts` - Main analysis orchestration hook
  - `useAnalyzerState.ts` - Analysis state management
  - `useAnalysisHistory.ts` - History management
  - `useLogVisibility.ts` - Log visibility control
  - `useResultsDisplay.ts` - Results display management
- `/utils` - Utility functions
- `/types` - TypeScript type definitions

#### `analysis-history/`
History management:
- `AnalysisHistory.tsx` - Previous analyses interface

#### `analysis-log/`
Progress logging:
- `AnalysisLog.tsx` - Analysis progress logging component

#### `ui/`
Reusable UI components (shadcn/ui):
- Buttons, Cards, Progress bars, etc.

#### Other Components
- `theme/` - Theme management
- `logo/` - Logo components
- `contact/` - Contact form

### `/lib`
Core utilities and services:
- `analytics.ts` - Analytics tracking
- `errors.ts` - Error handling
- `pdf-utils.ts` - PDF processing
- `storage.ts` - Local storage management
- `text-utils.ts` - Text processing
- `/services/openai` - OpenAI integration

## Key Features

### Contract Analysis
- Real-time analysis with progress tracking
- Support for PDF and DOCX files
- Chunked text processing for large documents
- Comprehensive results with key terms, risks, and recommendations

### Analysis History
- Local storage of previous analyses
- Quick access to recent results
- History management interface

### User Interface
- Dark/light mode support
- Responsive design
- Progress indicators
- Error handling with user-friendly messages

## State Management
Each major feature has its own state management:

### Analysis State
```typescript
const {
  file,
  error,
  isProcessing,
  isAnalyzing,
  status,
  progress,
  stage,
  currentChunk,
  totalChunks,
  analysis,
  isAnalyzed,
} = useAnalyzerState();
```

### History State
```typescript
const {
  analyses,
  selectedAnalysis,
  hasAnalyses,
  addAnalysis,
  removeAnalysis,
  clearHistory
} = useAnalysisHistory();
```

## Development Guidelines

### Adding New Features
1. Create components in appropriate directories
2. Implement hooks for state management
3. Add error handling
4. Include analytics tracking
5. Update documentation

### Code Style
- Use TypeScript for all components
- Follow existing component structure
- Use shadcn/ui components
- Implement proper error handling
- Add analytics tracking

### Deployment
Automatic deployment:
- Production deploys from main branch
- Create feature branches for new work
- Use PR process for code review

## Environment Setup
Required environment variables:
```env
OPENAI_API_KEY=your_key_here
SENTRY_DSN=your_sentry_dsn
ANALYTICS_ID=your_analytics_id
```

Development server:
```bash
npm run dev
```