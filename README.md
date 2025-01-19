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

### `components/contract-analyzer/`
Main application container:
- `ContractAnalyzer.tsx`: Main orchestrator component
- `components/`: UI components for different features
  - `analysis/`: Results display and controls
  - `upload/`: File handling
  - `layout/`: Layout components
- `hooks/`: Application logic
  - `state/`: State management
  - `analysis/`: Analysis processing
  - `storage/`: Cache handling

### `app/api/analyze/`
Server-side analysis:
- `route.ts`: API endpoint
- `chunk-analyzer.ts`: OpenAI interaction
- `analysis-processor.ts`: Document processing

### `lib/services/openai/`
AI integration:
- `prompts.ts`: AI prompts management
- `openai-service.ts`: API client

## Key Files

### `types/analysis.ts`
Shared TypeScript interfaces:
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
  };
}
```

### `app/actions.ts`
Server-side actions:
- Contract analysis using OpenAI
- Text chunking
- Error handling
- Analytics integration

### `lib/text-utils.ts`
Text processing utilities:
- Text extraction
- Error handling
- Worker configuration

## Documentation

Detailed documentation is available in the `docs/` directory:
- `PROJECT_STRUCTURE.md`: Detailed project organization
- `SUMMARY_GENERATION.md`: Contract summary system
- `TROUBLESHOOTING.md`: Debugging guide

## Development Guidelines

### Adding New Features
1. Place components in appropriate directories
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