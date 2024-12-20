'use client'

import { useState, useRef } from 'react'
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { analyzeContract } from '@/app/actions'
import { readPdfText } from '@/lib/pdf-utils'
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors'
import { 
  trackFileUploadStart,
  trackFileUploadSuccess,
  trackFileValidationError
} from '@/lib/analytics-events';

// Rest of the imports and interfaces...

export default function Hero() {
  // Existing state declarations...

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    trackFileUploadStart('drag_drop');
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelection(droppedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    trackFileUploadStart('click');
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
      trackFileValidationError('no_file');
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

    if (selectedFile.type !== 'application/pdf' && 
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const error = {
        message: 'Please upload a PDF or DOCX file.',
        type: 'error' as const
      };
      setError(error);
      trackFileValidationError('invalid_type', selectedFile.type);
      Sentry.captureMessage('Invalid file type selected', {
        level: 'warning',
        extra: {
          fileType: selectedFile.type,
          fileName: selectedFile.name
        }
      });
      return;
    }

    // Track successful file upload
    trackFileUploadSuccess(selectedFile.type, selectedFile.size);

    setFile(selectedFile)
    setAnalysis(null)
    setError(null)
  }

  // Rest of the component implementation...
