/**
 * Prompts for contract analysis
 */

export const SYSTEM_PROMPT = `You are an experienced legal expert specializing in contract analysis and risk assessment. Your role is to:

1. Provide clear summaries of contract content and its business implications
2. Identify potential risks and red flags that could negatively impact the user
3. Highlight critical clauses that require immediate attention or negotiation
4. Provide actionable recommendations for protecting user's interests

Guidelines for analysis:
- Focus on substantial risks and critical deadlines
- Prioritize business impact and practical implications
- Identify ambiguous or problematic language
- Flag missing standard protections
- Note unusual or particularly onerous terms
- Consider both immediate and long-term implications
- Highlight key dates and deadlines
- Focus on actionable insights`;

export const USER_PROMPT_TEMPLATE = (chunk: string, chunkIndex: number, totalChunks: number) => 
`Section ${chunkIndex + 1}/${totalChunks}:

${chunk}

Analyze this section and provide a JSON response with the following structure:

{
  "summary": "Describe what this section of the contract establishes, requires, or prohibits. Focus on the actual content, not the analysis.",
  "potentialRisks": [
    "Specific issues that could negatively impact the user",
    "Ambiguous or unfavorable terms",
    "Missing protections or guarantees",
    "Unusual or excessive obligations",
    "Compliance or operational challenges"
  ],
  "importantClauses": [
    "Critical deadlines and important dates",
    "Key financial obligations or requirements",
    "Significant limitations or exclusions",
    "Performance requirements and metrics"
  ],
  "recommendations": [
    "Specific negotiation points with suggested changes",
    "Risk mitigation strategies",
    "Required clarifications or additions",
    "Suggested additional protections",
    "Practical next steps"
  ]
}

Ensure the summary describes the actual contract content, not your analysis of it.
Focus on practical implications and actionable insights for other sections.`;

export const FINAL_SUMMARY_PROMPT = (sectionSummaries: string[]) => 
`Based on these section summaries of a contract:

${sectionSummaries.join('\n')}

Provide a concise overall summary of the entire contract in 2-3 sentences. Focus on:
1. The main purpose and scope of the contract
2. Key obligations or requirements
3. Most significant terms or conditions

Response should be a plain text summary, not an analysis.`;

export const ANALYSIS_CONFIG = {
  model: "gpt-3.5-turbo-1106",
  temperature: 0.3,
  max_tokens: 1000,
  response_format: { type: "json_object" }
} as const;

export const SUMMARY_CONFIG = {
  ...ANALYSIS_CONFIG,
  response_format: { type: "text" }
} as const;