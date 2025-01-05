'use client';

import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import * as Sentry from '@sentry/nextjs';
import { PDFProcessingError } from './errors';

// Only initialize worker in browser environment
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

type ProgressCallback = (progress: number) => void;

export async function readPdfText(file: File, onProgress?: ProgressCallback): Promise<string> {
  try {
    Sentry.addBreadcrumb({
      category: 'pdf',
      message: 'Starting PDF text extraction',
      level: 'info',
      data: {
        fileName: file.name,
        fileSize: file.size,
      },
    });

    if (file.size === 0) {
      throw new PDFProcessingError('Empty PDF file', 'EMPTY_FILE');
    }

    onProgress?.(1); // File validation complete
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(2); // File loaded
    
    // Load PDF document
    const pdf = await getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,  // Important: disable worker fetch to avoid CORS issues
      isEvalSupported: false, // Important: disable eval for security
      useSystemFonts: true    // Use system fonts when possible
    }).promise;
    
    onProgress?.(3); // PDF initialized
    
    // Validate page count
    const maxPages = pdf.numPages;
    if (maxPages === 0) {
      throw new PDFProcessingError('PDF file contains no pages', 'EMPTY_FILE');
    }

    // Calculate per-page progress increment
    const progressPerPage = 2 / maxPages; // 2% total for page extraction

    // Get all pages text with progress tracking
    const pageTexts = await Promise.all(
      Array.from({ length: maxPages }, (_, i) => {
        return getPageText(pdf, i + 1).then(text => {
          onProgress?.(3 + progressPerPage * (i + 1)); // Update progress for each page
          return text;
        });
      })
    );
    
    const fullText = pageTexts.join('\n\n');

    if (!fullText.trim()) {
      throw new PDFProcessingError('No readable text found in the PDF', 'NO_TEXT_CONTENT');
    }

    onProgress?.(5); // PDF processing complete
    return fullText;
  } catch (error) {
    console.error('Error reading PDF:', error);
    
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

    // Handle specific PDF.js errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF structure')) {
        const pdfError = new PDFProcessingError('The PDF file appears to be corrupted', 'CORRUPT_FILE', error);
        Sentry.captureException(pdfError, {
          extra: {
            fileName: file.name,
            fileSize: file.size,
          },
        });
        throw pdfError;
      }
      if (error.message.includes('Password required')) {
        const pdfError = new PDFProcessingError('Cannot process encrypted PDF files', 'INVALID_FORMAT', error);
        Sentry.captureException(pdfError, {
          extra: {
            fileName: file.name,
            fileSize: file.size,
          },
        });
        throw pdfError;
      }
    }

    Sentry.captureException(error, {
      extra: {
        fileName: file.name,
        fileSize: file.size,
      },
    });

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

    Sentry.captureException(error, {
      extra: {
        pageNumber: pageNo,
      },
    });

    throw new PDFProcessingError(
      `Failed to extract text from page ${pageNo}`,
      'EXTRACTION_ERROR',
      error
    );
  }
}