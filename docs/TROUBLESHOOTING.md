# Troubleshooting Guide

## Summary Generation Issues

### Diagnosing Issues

1. **Check Data Flow**
   ```
   Client → API → OpenAI → Client
   ```
   Check each step:
   - Client request logs
   - API endpoint logs
   - OpenAI response
   - Client display

2. **Examine Cache**
   ```typescript
   // In browser console
   localStorage.getItem('contract-analyses');
   ```

3. **Check Server Logs**
   - API response format
   - Validation errors
   - OpenAI interaction

### Common Issues

1. **Wrong Summary Format**

   Problem:
   ```
   "The contract outlines terms and conditions..."
   ```
   Instead of:
   ```
   "This is a purchase agreement between..."
   ```

   Debug Steps:
   1. Check `DOCUMENT_SUMMARY_PROMPT` in `prompts.ts`
   2. Verify prompt is being used in `chunk-analyzer.ts`
   3. Check validation in `generateDocumentSummary`
   4. Clear cached analyses

2. **Mixed Content in Summary**

   Problem:
   ```
   Summary includes analysis and recommendations
   ```

   Debug Steps:
   1. Check for multiple summary generations
   2. Verify section summaries are disabled
   3. Check result compilation in `processDocument`

3. **Cached Old Format**

   Problem:
   ```
   New format not showing despite changes
   ```

   Debug Steps:
   1. Check `SUMMARY_VERSION` in `prompts.ts`
   2. Verify version check in storage
   3. Clear local storage

### Debugging Tools

1. **Console Logging**
   ```typescript
   // In generateDocumentSummary
   console.log('Prompt:', DOCUMENT_SUMMARY_PROMPT);
   console.log('Response:', content);
   ```

2. **Network Inspection**
   - Check `/api/analyze` requests
   - Examine OpenAI API calls
   - Verify request/response formats

3. **State Inspection**
   ```typescript
   // In useAnalyzerState
   console.log('Current state:', state);
   console.log('Cache:', storage.get());
   ```

### Step-by-Step Debug Process

1. **Client Side**
   ```typescript
   // Add to useContractAnalyzer.ts
   console.log('File:', file);
   console.log('Analysis:', analysis);
   console.log('Cache:', storage.get());
   ```

2. **API Layer**
   ```typescript
   // Add to analysis-processor.ts
   console.log('Processing document...');
   console.log('Generated summary:', summary);
   console.log('Final result:', result);
   ```

3. **OpenAI Layer**
   ```typescript
   // Add to chunk-analyzer.ts
   console.log('OpenAI request:', {
     prompt: DOCUMENT_SUMMARY_PROMPT,
     text: summaryText
   });
   console.log('OpenAI response:', response);
   ```

### Quick Fixes

1. **Clear Cache**
   ```javascript
   localStorage.clear();
   ```

2. **Force New Format**
   ```typescript
   // In generateDocumentSummary
   if (!summary.startsWith('This is a')) {
     throw new Error('Invalid format');
   }
   ```

3. **Bypass Cache**
   ```typescript
   // In useAnalyzerState
   processing.setIsProcessingNew(true);
   ```

### Prevention

1. **Add Logging**
   ```typescript
   // In chunk-analyzer.ts
   console.log('[Summary] Input:', text.slice(0, 100));
   console.log('[Summary] Generated:', summary);
   ```

2. **Validate Outputs**
   ```typescript
   // In analysis-processor.ts
   if (!isValidFormat(summary)) {
     console.error('Invalid format:', summary);
     throw new Error('Format validation failed');
   }
   ```

3. **Version Control**
   ```typescript
   // In prompts.ts
   export const SUMMARY_VERSION = 'v2';
   ```

### When All Else Fails

1. **Full Reset**
   - Clear local storage
   - Restart development server
   - Check all console logs

2. **Deep Debug**
   - Add logs at every step
   - Check component re-renders
   - Verify data transformations

3. **Isolation Test**
   - Test OpenAI calls directly
   - Check prompt effectiveness
   - Verify client-side logic