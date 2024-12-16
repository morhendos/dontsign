'use client';

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { version } from 'pdfjs-dist/package.json';

// Only initialize worker in browser environment
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  // Use CDN-hosted worker with explicit version
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
}

export async function readPdfText(file: File): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,  // Important: disable worker fetch to avoid CORS issues
      isEvalSupported: false, // Important: disable eval for security
      useSystemFonts: true    // Use system fonts when possible
    }).promise;
    
    // Get all pages text
    const maxPages = pdf.numPages;
    const pageTextPromises = [];
    
    for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
      pageTextPromises.push(getPageText(pdf, pageNo));
    }
    
    const pageTexts = await Promise.all(pageTextPromises);
    const fullText = pageTexts.join('\n\n');

    if (!fullText.trim()) {
      throw new Error('No readable text found in the PDF');
    }

    return fullText;
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Could not read PDF file'
    );
  }
}

async function getPageText(pdf: any, pageNo: number): Promise<string> {
  try {
    const page = await pdf.getPage(pageNo);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    return pageText || `[Empty page ${pageNo}]`;
  } catch (error) {
    console.error(`Error reading page ${pageNo}:`, error);
    return `[Error reading page ${pageNo}]`;
  }
}
