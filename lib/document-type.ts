import { ContractAnalysisError } from "./errors";
import { openAIService } from "./services/openai/openai-service";
import { promptManager } from "./services/prompts";
import type { DocumentTypeResponse } from "./services/prompts/types";

export async function detectDocumentType(text: string): Promise<DocumentTypeResponse> {
  // Take a sample from the start of the document for classification
  const sampleText = text.slice(0, 3000);

  const [typePrompt, config] = await Promise.all([
    promptManager.getPrompt('document-type', { text: sampleText }),
    promptManager.getModelConfig('documentType')
  ]);

  const response = await openAIService.createChatCompletion({
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    response_format: config.response_format,
    messages: [
      { role: "user", content: typePrompt }
    ],
    stream: false
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new ContractAnalysisError('Document type detection failed', 'API_ERROR');
  }

  try {
    const result = JSON.parse(content) as DocumentTypeResponse;
    
    // Validate the response structure
    if (
      typeof result.isLegalDocument !== 'boolean' ||
      typeof result.documentType !== 'string' ||
      typeof result.confidence !== 'number' ||
      typeof result.explanation !== 'string' ||
      !['proceed_with_analysis', 'stop_analysis'].includes(result.recommendedAction)
    ) {
      throw new Error('Invalid response structure');
    }

    return result;
  } catch (error) {
    throw new ContractAnalysisError(
      'Failed to parse document type detection response',
      'API_ERROR'
    );
  }
}