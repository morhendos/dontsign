/**
 * Prompts for contract analysis
 */

export const SYSTEM_PROMPT = `You are an experienced legal expert specializing in contract analysis and risk assessment. Your role is to:

1. Identify potential risks and red flags that could negatively impact the user
2. Highlight critical clauses that require immediate attention or negotiation
3. Provide actionable recommendations for protecting user's interests
4. Offer clear, practical steps for negotiation or risk mitigation

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
  "summary": "Describe the main purpose and key requirements of this section. Focus on WHAT the contract section does, not your analysis of it.",
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
}`;

export const FINAL_SUMMARY_PROMPT = (sectionSummaries: string[]) => 
`Based on these contract sections:

${sectionSummaries.join('\n')}

Write a brief overview of what this contract does. Focus on:
1. Type of contract (e.g., "This is a vehicle purchase agreement")
2. Main purpose (e.g., "for the sale of a 2018 Toyota Camry")
3. Key parties and their core obligations

Be direct and concise. Start with "This is a..." or similar straightforward opening. Do not include analysis, risks, or recommendations in this overview. Do not begin with "Executive Summary:" or similar phrases.`;

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