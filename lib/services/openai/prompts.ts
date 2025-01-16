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

export const SYSTEM_SUMMARY_PROMPT = `You are an expert at writing clear, concise summaries of legal documents. Your role is to:

1. Identify and state the type of contract
2. Clearly describe its main purpose
3. Name the key parties involved
4. State ONLY the core obligations

Do not include:
- Analysis or opinions
- Risks or concerns
- Recommendations
- Detailed breakdowns
- Technical terms unless essential

Keep it simple, direct, and factual.`;

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
`Write a 2-3 sentence description of what this contract is and does. Keep it simple and factual.

DO:
- Start with "This is a [type] contract between [parties] for [purpose]"
- State only the core purpose and main obligations
- Use plain, direct language

DO NOT:
- Include analysis, risks, or recommendations
- List key terms or important clauses
- Use phrases like "Executive Summary" or "The contract outlines"
- Provide detailed breakdowns of terms
- Use technical legal terminology unless essential
- Exceed 3 sentences

Example good summary:
"This is a vehicle purchase agreement between John Smith (Seller) and Jane Doe (Buyer) for the sale of a 2018 Toyota Camry at $15,000. The seller will transfer vehicle ownership upon receiving full payment, and the buyer must complete registration within 30 days."

Contract sections to summarize:
${sectionSummaries.join('\n')}`;

// Core analysis configuration
export const ANALYSIS_CONFIG = {
  model: "gpt-3.5-turbo-1106",
  temperature: 0.3,
  max_tokens: 1000,
  response_format: { type: "json_object" }
} as const;

// Summary specific configuration - more constrained
export const SUMMARY_CONFIG = {
  model: "gpt-3.5-turbo-1106",
  temperature: 0.1,  // Lower temperature for more consistent, direct summaries
  max_tokens: 200,   // Limit length to encourage conciseness
  response_format: { type: "text" }
} as const;