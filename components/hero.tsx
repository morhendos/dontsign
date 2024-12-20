'use client'

import { useState, useRef } from 'react'
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { analyzeContract } from '@/app/actions'
import { readPdfText } from '@/lib/pdf-utils'
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors'
import { event as gaEvent } from '@/lib/analytics';

// Rest of the imports...

export default function Hero() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<ErrorDisplay | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelection = (selectedFile?: File) => {
    if (!selectedFile) {
      // ... existing error handling ...
      return;
    }

    // Track successful file selection
    gaEvent({
      action: 'file_selected',
      category: 'engagement',
      label: selectedFile.type,
      value: Math.round(selectedFile.size / 1024) // Size in KB
    });

    if (selectedFile.type !== 'application/pdf' && 
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // ... existing error handling ...

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

  const handleAnalyze = async () => {
    if (!file) {
      // ... existing error handling ...
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

    try {
      // ... existing analysis logic ...

      if (result) {
        setAnalysis(result);
        
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
      // ... existing error handling with added tracking ...
      
      if (error instanceof PDFProcessingError) {
        // Track PDF processing error
        gaEvent({
          action: 'analysis_error',
          category: 'error',
          label: `pdf_${error.code}`,
        });
      } else if (error instanceof ContractAnalysisError) {
        // Track analysis error
        gaEvent({
          action: 'analysis_error',
          category: 'error',
          label: `analysis_${error.code}`,
        });
      } else {
        // Track unexpected error
        gaEvent({
          action: 'analysis_error',
          category: 'error',
          label: 'unexpected_error',
        });
      }
    }
  }

  // ... rest of the component implementation ...
