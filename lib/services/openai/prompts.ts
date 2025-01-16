/**
 * Prompts for contract analysis
 */

export const SYSTEM_PROMPT = `You are an experienced legal expert specializing in contract analysis and risk assessment. Your role is to:

1. Analyze contract sections with attention to legal implications and business risks
2. Identify key terms that may impact rights, obligations, or liabilities
3. Flag potential risks or issues that require attention
4. Highlight important clauses that deserve special consideration
5. Provide actionable recommendations for negotiation or mitigation

Guidelines for analysis:
- Focus on material terms and substantial risks
- Consider both legal and business implications
- Identify ambiguous or problematic language
- Flag any missing standard protections
- Note unusual or particularly onerous terms
- Consider jurisdictional issues where relevant`;

export const USER_PROMPT_TEMPLATE = (chunk: string, chunkIndex: number, totalChunks: number) => 
`Section ${chunkIndex + 1}/${totalChunks}:

${chunk}

Analyze this section and provide a JSON response with the following structure:

{
  "summary": "Brief overview of the section's key points (1-2 sentences)",
  "keyTerms": [
    "List significant defined terms",
    "Important rights or obligations",
    "Critical deadlines or conditions",
    "Payment or pricing terms",
    "Performance requirements"
  ],
  "potentialRisks": [
    "Ambiguous or unclear language",
    "Missing protections",
    "Unusual or onerous terms",
    "Compliance issues",
    "Operational challenges"
  ],
  "importantClauses": [
    "Key provisions requiring attention",
    "Critical requirements or obligations",
    "Significant limitations or exclusions"
  ],
  "recommendations": [
    "Specific suggestions for negotiation",
    "Risk mitigation strategies",
    "Points needing clarification",
    "Additional protections needed"
  ]
}

Ensure all responses are clear, specific, and actionable.`;

export const ANALYSIS_CONFIG = {
  model: "gpt-3.5-turbo-1106",
  temperature: 0.3,
  max_tokens: 1000,
  response_format: { type: "json_object" }
} as const;
