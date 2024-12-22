'use client';

import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import * as PDFJS from 'pdfjs-dist';
import * as Sentry from '@sentry/nextjs';
import { PDFProcessingError } from './errors';

// Only initialize worker in browser environment
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  // Get the actual version being used
  const pdfVersion = PDFJS.version;
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.js`;
}

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
    
    // Add debug logging
    console.log('PDF processing:', {
      fileSize: file.size,
      fileName: file.name,
      workerSrc: GlobalWorkerOptions.workerSrc,
      pdfVersion: PDFJS.version
    });

    // Load PDF document
    const loadingTask = getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,  // Important: disable worker fetch to avoid CORS issues
      isEvalSupported: false, // Important: disable eval for security
      useSystemFonts: true    // Use system fonts when possible
    });

    // Add progress callback
    loadingTask.onProgress = (progress) => {
      console.log('PDF loading progress:', progress);
    };

    const pdf = await loadingTask.promise;
    
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
      // Track PDF-specific errors with context
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

    // Track unknown errors
    Sentry.captureException(error, {
      extra: {
        fileName: file.name,
        fileSize: file.size,
      },
    });

    throw new PDFProcessingError(
      'Could not read PDF file',
      'EXTRACTION_ERROR',
      error instanceof Error ? error : new Error(String(error))
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

    // Track page-specific errors
    Sentry.captureException(error, {
      extra: {
        pageNumber: pageNo,
      },
    });

    throw new PDFProcessingError(
      `Failed to extract text from page ${pageNo}`,
      'EXTRACTION_ERROR',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}