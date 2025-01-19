# Prompts System Documentation

## Overview
The DontSign application uses OpenAI's GPT models to analyze contracts through a system of carefully crafted prompts. Each prompt serves a specific purpose in the analysis pipeline.

## Prompt Locations
All prompts are centralized in `/lib/services/openai/prompts.ts`. This centralization ensures:
- Easy maintenance and updates
- Consistent prompt usage across the application
- Version control for prompt changes

## Core Prompts

### 1. Document Summary Prompt
```typescript
export const DOCUMENT_SUMMARY_PROMPT = `...`
```
**Purpose**: Creates a concise, factual description of what the contract is.

**Format Requirements**:
- Must start with "This is a [type] between [parties] for [purpose]"
- Focuses on document facts only
- No analysis or recommendations
- Clear, simple language

**Example Good Output**:
```
"This is a software development agreement between TechCorp (Client) and DevPro LLC (Developer) for creating a custom CRM system. The Developer will deliver the system in 3 phases over 12 months, with the Client paying $150,000 in milestone-based installments."
```

### 2. Analysis Prompt
```typescript
export const SYSTEM_PROMPT = `...`
```
**Purpose**: Identifies risks, clauses, and recommendations from contract sections.

**Areas of Focus**:
- Potential risks and red flags
- Critical clauses needing attention
- Actionable recommendations
- Negotiation guidance

### 3. Section Analysis Template
```typescript
export const USER_PROMPT_TEMPLATE = `...`
```
**Purpose**: Formats each section's analysis into structured JSON.

**Output Structure**:
```json
{
  "potentialRisks": [...],
  "importantClauses": [...],
  "recommendations": [...]
}
```

## OpenAI Configurations

### Analysis Config
```typescript
export const ANALYSIS_CONFIG = {
  model: "gpt-3.5-turbo-1106",
  temperature: 0.3,
  max_tokens: 1000,
  response_format: { type: "json_object" }
}
```
- Uses structured JSON output
- Higher temperature for varied analysis
- Generous token limit for detailed responses

### Summary Config
```typescript
export const SUMMARY_CONFIG = {
  model: "gpt-3.5-turbo-1106",
  temperature: 0.3,
  max_tokens: 300,
  response_format: { type: "text" }
}
```
- Text output format
- Balanced temperature for consistent yet natural summaries
- Limited tokens to encourage conciseness

## Modifying Prompts

### Guidelines for Changes
1. **Summary Changes**:
   - Keep the "This is a..." format
   - Focus on factual content
   - Test with various contract types
   - Update examples if format changes

2. **Analysis Changes**:
   - Maintain JSON structure
   - Keep field names consistent
   - Consider impact on UI display
   - Test with complex contracts

### Testing Process
1. Test new prompts with various contract types:
   - Employment agreements
   - Service contracts
   - License agreements
   - Purchase agreements

2. Verify outputs:
   - Summary format compliance
   - Analysis completeness
   - Response consistency
   - Error handling

### Implementation Steps
1. Update prompt in `prompts.ts`
2. Test locally with sample documents
3. Review outputs for consistency
4. Update documentation if format changes
5. Create PR with examples of before/after

## Common Issues and Solutions

### Summary Generation
- **Issue**: Summary too long/detailed
  - Solution: Adjust max_tokens or strengthen prompt constraints

- **Issue**: Missing key information
  - Solution: Expand the initial text chunk (currently 6000 chars)

### Analysis Generation
- **Issue**: Inconsistent structure
  - Solution: Ensure `response_format` is set to `json_object`

- **Issue**: Missing recommendations
  - Solution: Check temperature setting or add examples

## Best Practices

1. **Prompt Updates**:
   - Document changes in PR
   - Include example outputs
   - Consider UI impact
   - Test with edge cases

2. **Configuration**:
   - Keep temperatures consistent
   - Balance token limits
   - Match response formats to use case

3. **Maintenance**:
   - Regularly review prompts
   - Update examples as needed
   - Monitor API updates
   - Track model versions

## Future Improvements

1. **Potential Enhancements**:
   - Dynamic temperature adjustment
   - Context-aware prompting
   - Multi-model approach
   - More detailed error guidance

2. **Monitoring Ideas**:
   - Response quality metrics
   - Performance tracking
   - Error rate analysis
   - Token usage optimization