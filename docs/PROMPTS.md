# DontSign AI Prompts Documentation

## Current Prompt Structure

### 1. System Prompt
Used to set the AI's role and general guidelines.

```typescript
SYSTEM_PROMPT = `You are an experienced legal expert...`
```

**Purpose**: Establishes the AI as a legal expert for contract analysis
**Used in**: Main analysis for each chunk of text
**Config**:
- Model: gpt-3.5-turbo-1106
- Temperature: 0.3
- Max tokens: 1000
- Format: JSON

### 2. Document Summary Prompt
Used to generate an initial document overview.

```typescript
DOCUMENT_SUMMARY_PROMPT = `Provide a factual description...`
```

**Purpose**: Creates a concise summary of the document
**Used in**: Initial document processing
**Config**:
- Model: gpt-3.5-turbo-1106
- Temperature: 0.3
- Max tokens: 300
- Format: Text

### 3. User Prompt Template
Template for analyzing individual document chunks.

```typescript
USER_PROMPT_TEMPLATE = (chunk, index, total) => `Section ${index + 1}/${total}...`
```

**Purpose**: Analyzes document sections for risks and recommendations
**Used in**: Detailed chunk analysis
**Output Structure**:
- potentialRisks[]
- importantClauses[]
- recommendations[]

## Prompt Usage Flow

1. Initial Processing:
   - Document is received
   - Summary prompt is used on the first ~6000 characters
   - Generates document overview

2. Detailed Analysis:
   - Document is split into chunks
   - Each chunk processed with system prompt + user prompt template
   - Results aggregated

## Suggested Improvements

### 1. Centralized Prompt Management

Create a `prompts` directory with the following structure:

```
prompts/
├── config/
│   ├── models.json        # Model configurations
│   └── parameters.json    # Temperature, tokens, etc.
├── templates/
│   ├── system.txt        # System prompts
│   ├── analysis.txt      # Analysis templates
│   └── summary.txt       # Summary templates
└── index.ts              # Prompt management code
```

Example management code:

```typescript
// prompts/index.ts
import { promises as fs } from 'fs';
import path from 'path';

class PromptManager {
  private cache = new Map<string, string>();
  private configCache = new Map<string, any>();

  async getPrompt(name: string, variables?: Record<string, string>): Promise<string> {
    let prompt = this.cache.get(name);
    
    if (!prompt) {
      prompt = await fs.readFile(
        path.join(process.cwd(), 'prompts', 'templates', `${name}.txt`),
        'utf-8'
      );
      this.cache.set(name, prompt);
    }

    if (variables) {
      return this.replaceVariables(prompt, variables);
    }

    return prompt;
  }

  async getConfig(name: string): Promise<any> {
    let config = this.configCache.get(name);
    
    if (!config) {
      config = JSON.parse(
        await fs.readFile(
          path.join(process.cwd(), 'prompts', 'config', `${name}.json`),
          'utf-8'
        )
      );
      this.configCache.set(name, config);
    }

    return config;
  }

  private replaceVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
  }
}

export const promptManager = new PromptManager();
```

### 2. Version Control for Prompts

Prompts should be versioned and tracked:

```typescript
// prompts/config/versions.json
{
  "system": {
    "current": "1.2.0",
    "history": [
      {
        "version": "1.2.0",
        "date": "2024-01-19",
        "changes": "Improved risk assessment guidelines"
      }
    ]
  }
}
```

### 3. A/B Testing Support

Add capability to test different prompt versions:

```typescript
interface PromptTest {
  id: string;
  promptA: string;
  promptB: string;
  metrics: {
    accuracy: number;
    completeness: number;
    userSatisfaction: number;
  };
}
```

### 4. Environment-Specific Prompts

Support different prompts for development/production:

```typescript
// prompts/config/environments.json
{
  "development": {
    "model": "gpt-3.5-turbo-1106",
    "maxTokens": 500
  },
  "production": {
    "model": "gpt-3.5-turbo-1106",
    "maxTokens": 1000
  }
}
```

## Migration Plan

1. Create new prompt management structure
2. Move existing prompts to text files
3. Update service to use PromptManager
4. Add version tracking
5. Implement A/B testing

## Best Practices

1. Keep prompts in separate files for easy editing
2. Version control all prompt changes
3. Use templates with variables for dynamic content
4. Maintain separate development/production configs
5. Document prompt changes and their impacts
6. Test prompt changes thoroughly before deployment

## Testing Guidelines

1. Create test suite for prompt variations
2. Compare results between prompt versions
3. Track metrics for prompt performance
4. Use real-world examples for testing
5. Maintain test documents for consistency

## Monitoring and Analytics

Add prompt performance tracking:

```typescript
interface PromptMetrics {
  promptVersion: string;
  responseTime: number;
  tokenCount: number;
  completionRate: number;
  userFeedback?: {
    helpful: boolean;
    accurate: boolean;
    comments?: string;
  };
}
```