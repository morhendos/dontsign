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

## Core Components Structure

### `components/hero/`
The main interface container that orchestrates all sub-components:
- Manages global state (file, analysis results, errors)
- Handles main analysis flow
- Integrates with OpenAI API
- Manages real-time progress updates and streaming
- Handles analysis history and stored results

### `components/contract-upload/`
Handles file upload functionality:
- Drag & drop support
- File type validation (PDF/DOCX)
- Error handling for invalid files
- Analytics tracking for upload events

### `components/contract-analysis/`
Manages the analysis process:
- Analysis button with loading states
- Integration with server-side analysis
- Progress tracking visualization
- Real-time status updates

### `components/error/`
Error display components:
- Visual error feedback
- Different styles for warnings vs errors
- Clear error messaging

### `components/analysis-results/`
Displays analysis results:
- Modal presentation
- Responsive layout
- Animation transitions
- Previous analyses history

## Key Files and Their Purposes

### `types/analysis.ts`
Contains shared TypeScript interfaces:
```typescript
interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
  metadata?: {
    analyzedAt: string;
    documentName: string;
    modelVersion: string;
    totalChunks?: number;
  };
}
```

### `lib/storage.ts`
Handles analysis persistence:
```typescript
interface StoredAnalysis {
  id: string;
  fileName: string;
  analysis: AnalysisResult;
  analyzedAt: string;
}
```

### `app/api/analyze/route.ts`
API endpoint for contract analysis:
- Implements streaming response with progress updates
- Handles OpenAI API integration
- Processes text in chunks with real-time feedback

### `lib/pdf-utils.ts`
PDF processing utilities:
- Text extraction
- Error handling for corrupt files
- Worker configuration

## Features

### Real-time Analysis
- Progress tracking
- Status updates
- Streaming response handling

### Analysis History
- Local storage persistence
- View previous analyses
- Delete old analyses
- Quick access to recent results

### Error Handling
Comprehensive error handling system:
1. Custom error types
2. Sentry integration
3. User-friendly error messages
4. Analytics tracking

## State Management
Component state management using React hooks:
```typescript
// Analysis States
const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
const [currentStoredAnalysis, setCurrentStoredAnalysis] = 
  useState<StoredAnalysis | null>(null);

// UI States
const [showResults, setShowResults] = useState(false);
const [hasStoredAnalyses, setHasStoredAnalyses] = useState(false);
```

## Development Guidelines

### Adding New Features
1. Create components in appropriate directories
2. Update types if needed
3. Add error handling
4. Include analytics tracking
5. Update documentation

### Code Style
- Use TypeScript for all new components
- Follow existing component structure
- Use shadcn/ui components where possible
- Implement proper error handling
- Add analytics tracking

### Testing
Important areas to test:
- File upload handling
- Error scenarios
- Analysis process
- UI responsiveness
- History functionality

### Deployment
The project uses automatic deployment:
- Production deploys from main branch
- Create feature branches for new work
- Use PR process for code review

## Common Tasks

### Adding New Analysis Types
1. Update `AnalysisResult` interface
2. Modify OpenAI prompt
3. Add new section component
4. Update result display

### Modifying History Features
1. Update storage interface
2. Modify UI components
3. Update state management
4. Test persistence

## Environment Setup
Required environment variables:
```env
OPENAI_API_KEY=your_key_here
SENTRY_DSN=your_sentry_dsn
```

Development server:
```bash
npm run dev
```