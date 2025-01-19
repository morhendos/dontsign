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

export const DOCUMENT_SUMMARY_PROMPT = `You are tasked with creating a clear and factual summary of a legal document. Focus exclusively on what the document contains and establishes, not on analysis or implications.

Your summary must:
1. Start with "This is a [type] between [parties] for [purpose]"
2. State the core facts about the contract
3. Include key obligations if relevant
4. Use clear, simple language

Guidelines:
- ALWAYS start with "This is a"
- Focus on substance, not structure
- Use plain language
- Keep it concise but complete
- Include critical facts 

NEVER use phrases like:
- "The agreement outlines..."
- "This contract contains..."
- "The document sets forth..."
- "This agreement establishes..."

Example good summaries:
"This is a software development agreement between TechCorp (Client) and DevPro LLC (Developer) for creating a custom CRM system. The Developer will deliver the system in 3 phases over 12 months, with the Client paying $150,000 in milestone-based installments. The agreement includes standard warranties and maintenance support for 24 months after completion."

"This is a commercial lease agreement between Metro Properties Ltd (Landlord) and Quick Bites Inc (Tenant) for the retail space at 123 Main Street. The lease term is 5 years with a monthly rent of $5,000, increasing by 3% annually. The Tenant is responsible for utilities, interior maintenance, and must maintain $2M in liability insurance."

Example bad summaries:
"The agreement outlines terms and conditions for software development including timelines and payment schedules."

"This contract contains various provisions related to the lease of commercial property."`;

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
  temperature: 0.1,  // Lower temperature for consistent format
  max_tokens: 400,   // Increased to allow for more complete summaries
  response_format: { type: "text" }
} as const;