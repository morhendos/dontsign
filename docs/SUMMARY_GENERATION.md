# Contract Summary Generation System

## Overview
The contract summary generation is a core part of the DontSign application that provides users with a concise understanding of their legal documents. This document explains how the summary generation works and how to modify it.

## Architecture

### Data Flow
```
Client (Upload) → API → Text Processing → OpenAI → Client (Display)
                  ↑                          ↓
                  └── Storage Cache ←─────────┘
```

### Key Components

1. **Client Layer** (`components/contract-analyzer/`)
   - `ContractAnalyzer.tsx`: Main container component
   - `AnalysisResults.tsx`: Displays the summary and analysis
   - `useContractAnalyzer.ts`: Orchestrates the analysis flow
   - `useAnalyzerState.ts`: Manages state and caching

2. **API Layer** (`app/api/analyze/`)
   - `route.ts`: API endpoint handler
   - `analysis-processor.ts`: Main processing flow
   - `chunk-analyzer.ts`: Individual chunk analysis and summary generation
   - `types.ts`: TypeScript interfaces

3. **Shared Layer** (`lib/`)
   - `services/openai/prompts.ts`: Centralized prompt management
   - `text-utils.ts`: Text chunking and processing
   - `errors.ts`: Error handling

## Summary Generation Flow

1. **Document Upload**
   ```typescript
   // useContractAnalyzer.ts
   const handleFileSelect = async (newFile: File) => {
     setIsAnalyzed(false);
     processing.setShowResults(false);
     await handleFileSelect(newFile);
   }
   ```

2. **Cache Check**
   ```typescript
   // useAnalyzerState.ts
   const fileHash = await generateFileHash(file);
   const existingAnalysis = storage.find(a => a.fileHash === fileHash);
   ```

3. **Processing Start**
   ```typescript
   // analysis-processor.ts
   export async function processDocument(text: string, filename: string) {
     // 1. Text preprocessing
     // 2. Summary generation
     // 3. Detailed analysis
     // 4. Results compilation
   }
   ```

4. **Summary Generation**
   ```typescript
   // chunk-analyzer.ts
   export async function generateDocumentSummary(text: string) {
     const summaryText = text.slice(0, 6000);
     const response = await openai.chat.completions.create({
       messages: [
         { role: "system", content: DOCUMENT_SUMMARY_PROMPT },
         { role: "user", content: summaryText }
       ]
     });
   }
   ```

5. **Display**
   ```typescript
   // AnalysisResults.tsx
   <section>
     <h2>What is this contract?</h2>
     <p>{analysis.summary}</p>
   </section>
   ```

## Prompt Management

### Summary Format
The summary MUST follow this format:
```
"This is a [DOCUMENT TYPE] between [PARTY A] and [PARTY B] for [PURPOSE]."
```

### Validation Rules
1. Must start with "This is a"
2. Maximum 2 sentences
3. No analysis or recommendations
4. No forbidden terms ("outlines", "contains", etc.)

## Making Changes

### To Modify Summary Format

1. Update the prompt in `lib/services/openai/prompts.ts`:
   ```typescript
   export const DOCUMENT_SUMMARY_PROMPT = `...`;
   ```

2. Update validation in `chunk-analyzer.ts`:
   ```typescript
   if (!summary.startsWith('This is a')) {
     throw new ContractAnalysisError('Invalid format');
   }
   ```

3. Increment version in `prompts.ts` to invalidate cache:
   ```typescript
   export const SUMMARY_VERSION = 'v3';
   ```

### To Change Summary Generation Flow

1. Modify `generateDocumentSummary` in `chunk-analyzer.ts`
2. Update `processDocument` flow in `analysis-processor.ts`
3. Update progress indicators in `constants.ts`

## Error Handling

Summary generation has three layers of validation:

1. **Format Validation**
   ```typescript
   if (!summary.startsWith('This is a')) {
     throw new ContractAnalysisError('Invalid format');
   }
   ```

2. **Content Validation**
   ```typescript
   if (summary.includes('outlines')) {
     throw new ContractAnalysisError('Forbidden terms');
   }
   ```

3. **Length Validation**
   ```typescript
   const sentences = summary.split(/[.!?]+/);
   if (sentences.length > 2) {
     throw new ContractAnalysisError('Too long');
   }
   ```

## Caching Mechanism

Results are cached based on file hash:
```typescript
const fileHash = await generateFileHash(file);
storage.add({
  id: Date.now().toString(),
  fileHash,
  analysis,
  version: SUMMARY_VERSION
});
```

## Common Issues

1. **Old Format Summaries**
   - Caused by: Cached analyses from previous versions
   - Solution: Increment `SUMMARY_VERSION`

2. **Mixed Content**
   - Caused by: Section summaries mixing with document summary
   - Solution: Removed section summaries completely

3. **Incorrect Format**
   - Caused by: Weak prompt or validation
   - Solution: Strict prompt and multi-layer validation

## Testing Changes

1. Clear local storage to remove cached analyses
2. Test with various document types
3. Verify format compliance
4. Check error handling

## Best Practices

1. Always use central prompts from `prompts.ts`
2. Add strict validation for new formats
3. Version changes that affect output format
4. Update documentation for format changes

## Version History

- v1: Initial implementation with section summaries
- v2: Direct document summary with strict format

## External Dependencies

- OpenAI API: gpt-3.5-turbo-1106
- Local Storage: For caching
- PDF.js: For text extraction