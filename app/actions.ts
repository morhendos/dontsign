'use server'

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function analyzeContract(formData: FormData) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set')
    throw new Error('OpenAI API key is not configured. Please contact the administrator.')
  }

  const file = formData.get('file') as File
  if (!file) {
    console.error('No file uploaded')
    throw new Error('No file uploaded')
  }

  let fileContent: string
  try {
    fileContent = await file.text()
  } catch (error) {
    console.error('Error reading file:', error)
    throw new Error('Failed to read file content')
  }

  if (!fileContent || fileContent.trim().length === 0) {
    console.error('File content is empty')
    throw new Error('File content is empty')
  }

  try {
    const analysis = await generateText({
      model: openai('gpt-4o'),
      prompt: `Analyze the following contract and highlight key terms, potential risks, and important clauses. Provide a summary of the main points:

${fileContent}

Format your response as follows:
Summary:
[Provide a brief summary of the contract]

Key Terms:
- [List key terms]

Potential Risks:
- [List potential risks]

Important Clauses:
- [List important clauses]
`,
    })

    if (!analysis || !analysis.text) {
      console.error('No analysis generated')
      throw new Error('Failed to generate analysis')
    }

    return analysis.text
  } catch (error) {
    console.error('Error generating analysis:', error)
    throw new Error('Failed to analyze contract: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

