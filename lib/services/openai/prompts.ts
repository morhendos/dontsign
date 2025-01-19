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

export const DOCUMENT_SUMMARY_PROMPT = `Provide a factual description of the legal document, formatted as specified below.

Begin with:
"This is a [type] between [parties] for [purpose]."

Include:
- Document type
- Primary parties
- Core purpose
- Key terms if significant

Example:
"This is a software development agreement between TechCorp (Client) and DevPro LLC (Developer) for creating a custom CRM system. The Developer will deliver the system in 3 phases over 12 months, with the Client paying $150,000 in milestone-based installments."
`;

export const USER_PROMPT_TEMPLATE = (chunk: string, chunkIndex: number, totalChunks: number) => 
`Section ${chunkIndex + 1}/${totalChunks}:

${chunk}

Provide a JSON response with the following structure:

{
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

// OpenAI API configurations
export const ANALYSIS_CONFIG = {
  model: "gpt-3.5-turbo-1106",
  temperature: 0.3,
  max_tokens: 1000,
  response_format: { type: "json_object" }
} as const;

export const SUMMARY_CONFIG = {
  model: "gpt-3.5-turbo-1106",
  temperature: 0.3,
  max_tokens: 300,
  response_format: { type: "text" }
} as const;
