'use client';

import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import * as Sentry from '@sentry/nextjs';
import { PDFProcessingError } from './errors';

// PDF.js worker initialization with error handling
const initializePdfWorker = () => {
  if (typeof window === 'undefined') return; // Skip on server

  try {
    if (!GlobalWorkerOptions.workerSrc) {
      // Use local worker file to avoid CORS and security issues
      GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
  } catch (error) {
    console.warn('PDF Worker initialization warning - this is expected in development:', error);
  }
};

// Initialize worker once
initializePdfWorker();

// Configuration for PDF.js to minimize console output
const PDF_CONFIG = {
  useWorkerFetch: false,      // Disable worker fetch to avoid CORS issues
  isEvalSupported: false,     // Disable eval for security
  useSystemFonts: true,       // Use system fonts when possible
  verbosity: 0,               // Reduce console output
  disableAutoFetch: true,     // Disable auto fetching
  disableStream: true,        // Disable streaming
  disableFontFace: true       // Disable font face loading
};

export async function readPdfText(file: File): Promise<string> {
  try {
    // Add breadcrumb for PDF processing start
    Sentry.addBreadcrumb({
      category: 'pdf',
      message: 'Starting PDF text extraction',
      level: 'info',
      data: {
        fileName: file.name,
        fileSize: file.size,
      },
    });

    // Validate file size
    if (file.size === 0) {
      throw new PDFProcessingError('Empty PDF file', 'EMPTY_FILE');
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF with enhanced configuration
    const pdf = await getDocument({
      ...PDF_CONFIG,
      data: arrayBuffer
    }).promise;
    
    // Validate page count
    const maxPages = pdf.numPages;
    if (maxPages === 0) {
      throw new PDFProcessingError('PDF file contains no pages', 'EMPTY_FILE');
    }

    // Add breadcrumb for successful PDF loading
    Sentry.addBreadcrumb({
      category: 'pdf',
      message: 'PDF document loaded successfully',
      level: 'info',
      data: {
        pageCount: maxPages,
      },
    });

    // Extract text with error handling per page
    const pageTexts = await Promise.all(
      Array.from({ length: maxPages }, async (_, i) => {
        try {
          return await getPageText(pdf, i + 1);
        } catch (error) {
          // Log warning but continue processing
          console.warn(`Warning: Page ${i + 1} text extraction issue:`, error);
          return `[Text extraction error on page ${i + 1}]`;
        }
      })
    );
    
    const fullText = pageTexts.join('\n\n').trim();

    if (!fullText) {
      throw new PDFProcessingError('No readable text found in the PDF', 'NO_TEXT_CONTENT');
    }

    return fullText;
  } catch (error) {
    // Error handling with specific error types
    if (error instanceof PDFProcessingError) {
      Sentry.captureException(error, {
        extra: {
          fileName: file.name,
          fileSize: file.size,
          errorCode: error.code,
        },
      });
      throw error;
    }

    if (error instanceof Error) {
      let pdfError;
      
      if (error.message.includes('Invalid PDF structure')) {
        pdfError = new PDFProcessingError(
          'The PDF file appears to be corrupted',
          'CORRUPT_FILE',
          error
        );
      } else if (error.message.includes('Password required')) {
        pdfError = new PDFProcessingError(
          'Cannot process encrypted PDF files',
          'INVALID_FORMAT',
          error
        );
      } else {
        pdfError = new PDFProcessingError(
          'Could not read PDF file',
          'EXTRACTION_ERROR',
          error
        );
      }

      Sentry.captureException(pdfError, {
        extra: {
          fileName: file.name,
          fileSize: file.size,
        },
      });
      
      throw pdfError;
    }

    // Generic error handling
    const genericError = new PDFProcessingError(
      'Could not read PDF file',
      'EXTRACTION_ERROR',
      error
    );

    Sentry.captureException(genericError, {
      extra: {
        fileName: file.name,
        fileSize: file.size,
      },
    });

    throw genericError;
  }
}

async function getPageText(pdf: PDFDocumentProxy, pageNo: number): Promise<string> {
  try {
    const page = await pdf.getPage(pageNo);
    const textContent = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false
    });
    
    if (!textContent.items || !Array.isArray(textContent.items)) {
      throw new PDFProcessingError(
        `Invalid text content structure on page ${pageNo}`,
        'EXTRACTION_ERROR'
      );
    }

    // Clean text processing
    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return pageText || `[Empty page ${pageNo}]`;
  } catch (error) {
    console.warn(`Warning: Error reading page ${pageNo}:`, error);

    // Track page-specific errors
    Sentry.captureException(error, {
      extra: {
        pageNumber: pageNo,
      },
    });

    throw error;
  }
}