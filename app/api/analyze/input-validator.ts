import { NextRequest } from 'next/server';
import { ContractAnalysisError } from '@/lib/errors';

export interface ValidatedInput {
  text: string;
  filename: string;
}

export async function validateInput(request: NextRequest): Promise<ValidatedInput> {
  console.log('[Server] Reading request form data...');
  const data = await request.formData();
  
  const text = data.get('text');
  const filename = data.get('filename');
  console.log('[Server] Text length:', text?.toString().length);
  console.log('[Server] Filename:', filename);

  if (!text || typeof text !== 'string' || !filename) {
    throw new ContractAnalysisError("Invalid input", "INVALID_INPUT");
  }

  return { text, filename: filename.toString() };
}