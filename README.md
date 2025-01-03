## DontSign - Contract Analysis Application

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

## Core Components Structure

### `components/hero/`
The main interface container that orchestrates all sub-components:
- Manages global state (file, analysis results, errors)
- Handles main analysis flow
- Integrates with OpenAI API
- Manages real-time progress updates and streaming
- Provides user feedback during analysis

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
- Error handling for analysis process

### `components/error/`
Error display components:
- Visual error feedback
- Different styles for warnings vs errors
- Clear error messaging

### `components/analysis-results/`
Displays analysis results:
- Modular sections for different result types
- Metadata display
- Responsive layout

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

### `app/api/analyze/route.ts`
API endpoint for contract analysis:
- Implements streaming response with progress updates
- Handles OpenAI API integration
- Processes text in chunks with real-time feedback
- Aggregates analysis results
- Provides structured error handling

### `app/actions.ts`
Server-side actions:
- Contract analysis using OpenAI
- Text chunking
- Error handling
- Analytics integration

### `lib/pdf-utils.ts`
PDF processing utilities:
- Text extraction
- Error handling for corrupt files
- Worker configuration

## OpenAI Integration

### Prompt Structure
The system uses structured prompts for consistent analysis:

```typescript
const prompt = `Analyze the following contract text and provide a structured analysis in JSON format.
This is chunk ${chunkIndex + 1} of ${totalChunks}.

Contract text:
${chunk}

Provide your analysis as a JSON object with the following structure:
{
  "keyTerms": [list of important terms and definitions],
  "potentialRisks": [list of concerning clauses or potential risks],
  "importantClauses": [list of significant clauses and their implications],
  "recommendations": [list of points for review or negotiation]
}`;
```

System message emphasizes legal expertise:
```typescript
role: "system",
content: "You are a legal analysis assistant specialized in contract review. Analyze the contract and return results in JSON format. Focus on identifying key terms, potential risks, and important clauses. Be concise and precise."
```

## Error Handling
The application uses a comprehensive error handling system:
1. Custom error types:
   - `PDFProcessingError`
   - `ContractAnalysisError`
2. Sentry integration for tracking
3. User-friendly error messages
4. Analytics tracking for errors

## Analytics
Events tracked:
- File uploads
- Analysis starts/completions
- Errors
- User interactions
- Analysis progress transitions

## State Management
Component state management using React hooks:
```typescript
const [file, setFile] = useState<File | null>(null);
const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [error, setError] = useState<ErrorDisplay | null>(null);
const [progress, setProgress] = useState(0);
const [stage, setStage] = useState<'preprocessing' | 'analyzing' | 'complete'>('preprocessing');
const [processingStatus, setProcessingStatus] = useState<string>('');
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
- Add analytics tracking for new features

### Testing
Important areas to test:
- File upload handling
- Error scenarios
- Analysis process
- UI responsiveness
- Progress feedback accuracy

### Deployment
The project uses automatic deployment:
- Production deploys from main branch
- Create feature branches for new work
- Use PR process for code review

## Common Tasks

### Adding New Analysis Types
1. Update `AnalysisResult` interface
2. Modify OpenAI prompt in `actions.ts`
3. Add new section component
4. Update result display

### Modifying Error Handling
1. Add new error type if needed
2. Update error handling in relevant components
3. Add Sentry tracking
4. Update error display component

### Adding UI Components
1. Follow existing component structure
2. Use Tailwind for styling
3. Implement proper TypeScript interfaces
4. Add error handling where needed

## Future Improvements
Potential areas for enhancement:
1. Support for more file types
2. Batch processing
3. Enhanced analysis features
4. Improved error recovery
5. Offline capabilities
6. User accounts and history
7. Enhanced progress visualization
8. More granular progress updates

## Troubleshooting
Common issues and solutions:
1. PDF Processing Issues
   - Check file corruption
   - Verify PDF.js worker
   - Check file size limits
2. Analysis Errors
   - Verify OpenAI API key
   - Check text chunking
   - Monitor rate limits
3. UI Issues
   - Clear browser cache
   - Check console errors
   - Verify component props
4. Progress Bar Issues
   - Check stream connection
   - Verify progress updates
   - Monitor analysis stages

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