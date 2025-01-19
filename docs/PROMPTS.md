# DontSign Prompt Management

## Overview
The prompt management system provides a centralized way to manage all AI prompts used in the application. This makes it easy to modify prompts, maintain versioning, and ensure consistency across the application.

## Directory Structure
```
prompts/
├── config/
│   └── models.json        # Model configurations for different analysis types
├── templates/
    ├── system.txt         # System role and guidelines
    ├── analysis.txt       # Analysis prompt template
    └── summary.txt        # Document summary prompt
```

## Prompts

### 1. System Role (system.txt)
Defines the AI's role and general guidelines for contract analysis.

**Purpose**: Sets the foundational behavior and expertise of the AI
**Used in**: Main contract analysis
**Location**: `prompts/templates/system.txt`

### 2. Analysis Prompt (analysis.txt)
Template for analyzing individual document sections.

**Purpose**: Guides the chunk-by-chunk analysis
**Used in**: Detailed contract analysis
**Variables**: 
- `{{chunkIndex}}` - Current section number
- `{{totalChunks}}` - Total sections
- `{{chunk}}` - Text content

### 3. Summary Prompt (summary.txt)
Template for generating document overviews.

**Purpose**: Creates initial document summary
**Used in**: Initial document assessment

## Model Configurations

### Analysis Config
```json
{
  "model": "gpt-3.5-turbo-1106",
  "temperature": 0.3,
  "max_tokens": 1000,
  "response_format": { "type": "json_object" }
}
```

### Summary Config
```json
{
  "model": "gpt-3.5-turbo-1106",
  "temperature": 0.3,
  "max_tokens": 300,
  "response_format": { "type": "text" }
}
```

## Usage

### In Server Actions
```typescript
// Import the prompt manager
import { promptManager } from '@/lib/services/prompts';

// Get a prompt
const systemPrompt = await promptManager.getPrompt('system');

// Get a prompt with variables
const analysisPrompt = await promptManager.getPrompt('analysis', {
  chunk: textChunk,
  chunkIndex: String(index),
  totalChunks: String(total)
});

// Get model configuration
const config = await promptManager.getModelConfig('analysis');
```

## Modifying Prompts

1. Navigate to the appropriate template file in `prompts/templates/`
2. Edit the prompt text
3. Save the file
4. Changes take effect immediately (no rebuild required)

When editing prompts:
- Maintain any existing variables (marked with {{variable}})
- Keep the output format consistent
- Test changes thoroughly
- Document significant changes

## Output Formats

### Analysis Output
```json
{
  "potentialRisks": ["risk 1", "risk 2", ...],
  "importantClauses": ["clause 1", "clause 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}
```

### Summary Output
Free text format following the structure:
"This is a [type] between [parties] for [purpose]."

## Best Practices

1. **Prompt Modifications**
   - Test changes in development first
   - Keep prompts focused and clear
   - Maintain consistent formatting
   - Document any special requirements

2. **Version Control**
   - Commit prompt changes with clear messages
   - Document major changes in CHANGELOG.md
   - Keep backups of working prompts

3. **Testing Changes**
   - Test with various document types
   - Verify output format consistency
   - Check edge cases
   - Monitor performance impact

## Troubleshooting

### Common Issues
1. Invalid JSON responses
   - Check response format specifications
   - Verify prompt formatting
   - Review model temperature settings

2. Missing or incorrect variables
   - Verify variable names match exactly
   - Check for typos in variable syntax
   - Ensure all required variables are provided

3. Inconsistent outputs
   - Review temperature settings
   - Check prompt clarity
   - Verify model configuration
