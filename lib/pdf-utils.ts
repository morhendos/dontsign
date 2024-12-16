'use client';

import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';

// Only initialize worker in browser environment
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${GlobalWorkerOptions.version}/pdf.worker.min.js`;
}

export async function readPdfText(file: File): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    // Get all pages text
    const maxPages = pdf.numPages;
    const pageTextPromises = [];
    
    for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
      pageTextPromises.push(getPageText(pdf, pageNo));
    }
    
    const pageTexts = await Promise.all(pageTextPromises);
    return pageTexts.join('\n');
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new Error('Could not read PDF file');
  }
}

async function getPageText(pdf: PDFDocumentProxy, pageNo: number): Promise<string> {
  try {
    const page = await pdf.getPage(pageNo);
    const textContent = await page.getTextContent();
    
    return textContent.items
      .map((item: any) => item.str)
      .join(' ');
  } catch (error) {
    console.error(`Error reading page ${pageNo}:`, error);
    return `[Error reading page ${pageNo}]`;
  }
}
