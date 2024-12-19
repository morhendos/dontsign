'use client';

import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import { PDFProcessingError } from './errors';

// Only initialize worker in browser environment
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  // Use a specific version that matches our package.json dependency
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
}

export async function readPdfText(file: File): Promise<string> {
  try {
    // Validate file size
    if (file.size === 0) {
      throw new PDFProcessingError('Empty PDF file', 'EMPTY_FILE');
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,  // Important: disable worker fetch to avoid CORS issues
      isEvalSupported: false, // Important: disable eval for security
      useSystemFonts: true    // Use system fonts when possible
    }).promise;
    
    // Validate page count
    const maxPages = pdf.numPages;
    if (maxPages === 0) {
      throw new PDFProcessingError('PDF file contains no pages', 'EMPTY_FILE');
    }

    // Get all pages text
    const pageTexts = await Promise.all(
      Array.from({ length: maxPages }, (_, i) => getPageText(pdf, i + 1))
    );
    
    const fullText = pageTexts.join('\n\n');

    if (!fullText.trim()) {
      throw new PDFProcessingError('No readable text found in the PDF', 'NO_TEXT_CONTENT');
    }

    return fullText;
  } catch (error) {
    console.error('Error reading PDF:', error);
    
    if (error instanceof PDFProcessingError) {
      throw error;
    }

    // Handle specific PDF.js errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF structure')) {
        throw new PDFProcessingError('The PDF file appears to be corrupted', 'CORRUPT_FILE', error);
      }
      if (error.message.includes('Password required')) {
        throw new PDFProcessingError('Cannot process encrypted PDF files', 'INVALID_FORMAT', error);
      }
    }

    throw new PDFProcessingError(
      'Could not read PDF file',
      'EXTRACTION_ERROR',
      error
    );
  }
}

async function getPageText(pdf: PDFDocumentProxy, pageNo: number): Promise<string> {
  try {
    const page = await pdf.getPage(pageNo);
    const textContent = await page.getTextContent();
    
    if (!textContent.items || !Array.isArray(textContent.items)) {
      throw new PDFProcessingError(
        `Invalid text content structure on page ${pageNo}`,
        'EXTRACTION_ERROR'
      );
    }

    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ');

    return pageText || `[Empty page ${pageNo}]`;
  } catch (error) {
    console.error(`Error reading page ${pageNo}:`, error);
    throw new PDFProcessingError(
      `Failed to extract text from page ${pageNo}`,
      'EXTRACTION_ERROR',
      error
    );
  }
}