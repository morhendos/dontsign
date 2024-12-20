'use client'

import { useState, useRef } from 'react'
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { analyzeContract } from '@/app/actions'
import { readPdfText } from '@/lib/pdf-utils'
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors'
import { event as gaEvent } from '@/lib/analytics';

interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
  metadata?: {
    analyzedAt: string;
    documentName: string;
    modelVersion: string;
    totalChunks?: number;
  };
}

interface ErrorDisplay {
  message: string;
  type: 'error' | 'warning';
}

export default function Hero() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<ErrorDisplay | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelection(droppedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    handleFileSelection(selectedFile)
  }

  const handleFileSelection = (selectedFile?: File) => {
    if (!selectedFile) {
      const error = {
        message: 'Please select a file to analyze.',
        type: 'warning' as const
      };
      setError(error);
      Sentry.addBreadcrumb({
        category: 'file',
        message: 'File selection failed - no file selected',
        level: 'warning'
      });
      return;
    }

    Sentry.addBreadcrumb({
      category: 'file',
      message: 'File selected',
      level: 'info',
      data: {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size
      }
    });

    // Track successful file selection
    gaEvent({
      action: 'file_selected',
      category: 'engagement',
      label: selectedFile.type,
      value: Math.round(selectedFile.size / 1024) // Size in KB
    });

    if (selectedFile.type !== 'application/pdf' && 
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const error = {
        message: 'Please upload a PDF or DOCX file.',
        type: 'error' as const
      };
      setError(error);
      Sentry.captureMessage('Invalid file type selected', {
        level: 'warning',
        extra: {
          fileType: selectedFile.type,
          fileName: selectedFile.name
        }
      });

      // Track invalid file type error
      gaEvent({
        action: 'file_error',
        category: 'error',
        label: `invalid_type_${selectedFile.type}`,
      });
      return;
    }

    setFile(selectedFile)
    setAnalysis(null)
    setError(null)
  }

  const handleAreaClick = () => {
    fileInputRef.current?.click()
  }

  const handleAnalyze = async () => {
    if (!file) {
      const error = {
        message: 'Please upload a file before analyzing.',
        type: 'warning' as const
      };
      setError(error);
      Sentry.addBreadcrumb({
        category: 'analysis',
        message: 'Analysis attempted without file',
        level: 'warning'
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // Track analysis start
    gaEvent({
      action: 'analysis_started',
      category: 'engagement',
      label: file.type,
      value: Math.round(file.size / 1024) // Size in KB
    });

    Sentry.addBreadcrumb({
      category: 'analysis',
      message: 'Starting contract analysis',
      level: 'info',
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    });

    try {
      // Extract text based on file type
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }

      Sentry.addBreadcrumb({
        category: 'analysis',
        message: 'Text extracted successfully',
        level: 'info',
        data: {
          textLength: text.length
        }
      });

      // Create FormData with text content
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Send for analysis
      const result = await analyzeContract(formData);
      
      if (result) {
        setAnalysis(result);
        Sentry.addBreadcrumb({
          category: 'analysis',
          message: 'Analysis completed successfully',
          level: 'info',
          data: {
            chunkCount: result.metadata?.totalChunks
          }
        });

        // Track successful analysis
        gaEvent({
          action: 'analysis_completed',
          category: 'engagement',
          label: file.type,
          value: result.metadata?.totalChunks
        });
      } else {
        throw new ContractAnalysisError(
          'No analysis result received',
          'INVALID_INPUT'
        );
      }
    } catch (error) {
      console.error('Error analyzing contract:', error);
      
      if (error instanceof PDFProcessingError) {
        let errorMessage: string;
        let errorCode: string;
        switch (error.code) {
          case 'EMPTY_FILE':
            errorMessage = 'The PDF file appears to be empty.';
            errorCode = 'empty_file';
            break;
          case 'CORRUPT_FILE':
            errorMessage = 'The PDF file appears to be corrupted. Please check the file and try again.';
            errorCode = 'corrupt_file';
            break;
          case 'NO_TEXT_CONTENT':
            errorMessage = 'No readable text found in the PDF. The file might be scanned or image-based.';
            errorCode = 'no_text';
            break;
          default:
            errorMessage = 'Could not read the PDF file. Please ensure it\'s not encrypted or corrupted.';
            errorCode = 'pdf_error';
        }
        setError({ message: errorMessage, type: 'error' });

        // Track PDF processing error
        gaEvent({
          action: 'analysis_error',
          category: 'error',
          label: `pdf_${errorCode}`,
        });
      } else if (error instanceof ContractAnalysisError) {
        let errorMessage: string;
        let errorCode: string;
        switch (error.code) {
          case 'API_ERROR':
            errorMessage = 'The AI service is currently unavailable. Please try again later.';
            errorCode = 'api_error';
            break;
          case 'INVALID_INPUT':
            errorMessage = 'The document format is not supported. Please try a different file.';
            errorCode = 'invalid_input';
            break;
          case 'TEXT_PROCESSING_ERROR':
            errorMessage = 'Error processing the document text. Please try a simpler document.';
            errorCode = 'text_processing';
            break;
          default:
            errorMessage = `An error occurred: ${error.message}. Please try again.`;
            errorCode = 'unknown';
        }
        setError({ message: errorMessage, type: 'error' });

        // Track analysis error
        gaEvent({
          action: 'analysis_error',
          category: 'error',
          label: `analysis_${errorCode}`,
        });
      } else {
        setError({
          message: 'An unexpected error occurred. Please try again.',
          type: 'error'
        });

        // Track unexpected error
        gaEvent({
          action: 'analysis_error',
          category: 'error',
          label: 'unexpected_error',
        });

        // Track unexpected errors in Sentry
        Sentry.captureException(error, {
          extra: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          }
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Rest of the component remains the same...
