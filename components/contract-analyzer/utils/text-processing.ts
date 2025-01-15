import { readPdfText } from '@/lib/pdf-utils';
import type { FileProcessingResult } from '../types';

export const processFile = async (file: File): Promise<FileProcessingResult> => {
  const text = file.type === 'application/pdf'
    ? await readPdfText(file)
    : await file.text();

  return {
    text,
    type: file.type,
    name: file.name
  };
};

export const validateFile = (file: File): boolean => {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  return validTypes.includes(file.type);
};
