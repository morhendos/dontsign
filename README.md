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
- Server-Sent Events (SSE) for real-time progress updates

## Core Features

### Contract Analysis
- PDF and DOCX file support
- Real-time analysis progress tracking
- Chunk-based processing for large documents
- Comprehensive analysis results:
  - Executive summary
  - Key terms identification
  - Risk assessment
  - Important clauses
  - Recommendations

### Progress Tracking
The application implements real-time progress tracking using Server-Sent Events:
1. File upload and validation
2. Text extraction
3. Chunk-based analysis
4. Results aggregation
5. Final summary generation

## Core Components

### `app/api/analyze/route.ts`
Handles contract analysis:
- Implements streaming response using ReadableStream
- Processes text in chunks
- Integrates with OpenAI API
- Provides real-time progress updates
- Aggregates analysis results

### `components/hero/Hero.tsx`
Main interface container:
- Manages file upload and analysis flow
- Handles stream processing
- Provides progress feedback
- Displays analysis results

### `components/contract-analysis/AnalysisProgress.tsx`
Visualizes analysis progress:
- Shows current analysis stage
- Displays progress percentage
- Indicates processing status

## OpenAI Integration

### Analysis Process
1. Document is split into manageable chunks
2. Each chunk is analyzed separately with structured prompts
3. Results are aggregated and deduplicated
4. Final summary is generated

### Prompt Structure
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

## Error Handling
Comprehensive error handling at multiple levels:
1. File validation
2. Text extraction
3. OpenAI API interaction
4. Stream processing
5. Progress updates

## Analytics
Events tracked:
- File uploads
- Analysis starts/completions
- Processing errors
- Stage transitions

## Development Guidelines

### Adding New Features
1. Create components in appropriate directories
2. Update types if needed
3. Add error handling
4. Include analytics tracking
5. Update documentation

### Code Style
- Use TypeScript for all components
- Follow existing component structure
- Use shadcn/ui components where possible
- Implement proper error handling
- Add analytics tracking for new features

### Testing
Key areas to test:
- File upload handling
- Progress bar functionality
- Stream processing
- Error scenarios
- Analysis results display

## Future Improvements
1. Enhanced progress bar visualization
2. More granular progress updates
3. Improved error recovery
4. Batch processing support
5. Offline capabilities

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