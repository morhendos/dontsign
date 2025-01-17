# DontSign - Contract Analysis Application

## Project Overview
DontSign is a web application that helps users analyze contracts using AI. It processes PDF and DOCX files, extracting text and using OpenAI's GPT API to provide detailed analysis including potential risks, critical requirements, and actionable recommendations.

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
- Error handling for analysis process

### `components/error/`
Error display components:
- Visual error feedback
- Different styles for warnings vs errors
- Clear error messaging

### `components/analysis-results/`
Displays analysis results in a clear, structured format:
- Contract overview
- Potential risks with color-coded warnings
- Critical dates and requirements
- Next steps and recommendations
- Progress tracking and metadata

## Key Files and Their Purposes

### `types/analysis.ts`
Contains shared TypeScript interfaces:
```typescript
interface AnalysisResult {
  summary: string;
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
  metadata?: {
    analyzedAt: string;
    documentName: string;
    modelVersion: string;
    totalChunks?: number;
    sectionsAnalyzed?: number;
    stage?: 'preprocessing' | 'analyzing' | 'complete';
    progress?: number;
  };
}
```

### `lib/services/openai/prompts.ts`
Manages AI analysis prompts:
- System instructions for legal analysis
- User prompts for section analysis
- Final summary generation
- Analysis configuration

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

## State Management
Component state management using React hooks:
```typescript
const [state, setState] = useState<AnalysisState>({
  analysis: null,
  isAnalyzing: false,
  error: null,
  progress: 0,
  stage: 'preprocessing',
  sectionsAnalyzed: 0,
  totalChunks: 0
});
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

### Deployment
The project uses automatic deployment:
- Production deploys from main branch
- Create feature branches for new work
- Use PR process for code review

## Common Tasks

### Modifying Analysis Output
1. Update prompts in `lib/services/openai/prompts.ts`
2. Modify types in `types/analysis.ts`
3. Update UI components to reflect changes
4. Test with various contract types

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