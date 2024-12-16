'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { analyzeContract } from '@/app/actions'
import { readPdfText } from '@/lib/pdf-utils'
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors'

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
      setError({
        message: 'Please select a file to analyze.',
        type: 'warning'
      })
      return
    }

    if (selectedFile.type !== 'application/pdf' && 
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setError({
        message: 'Please upload a PDF or DOCX file.',
        type: 'error'
      })
      return
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
      setError({
        message: 'Please upload a file before analyzing.',
        type: 'warning'
      })
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Extract text based on file type
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }

      // Create FormData with text content
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Send for analysis
      const result = await analyzeContract(formData);
      
      if (result) {
        setAnalysis(result);
      } else {
        throw new ContractAnalysisError(
          'No analysis result received',
          'INVALID_INPUT'
        );
      }
    } catch (error) {
      console.error('Error analyzing contract:', error);
      
      if (error instanceof PDFProcessingError) {
        switch (error.code) {
          case 'EMPTY_FILE':
            setError({
              message: 'The PDF file appears to be empty.',
              type: 'error'
            });
            break;
          case 'CORRUPT_FILE':
            setError({
              message: 'The PDF file appears to be corrupted. Please check the file and try again.',
              type: 'error'
            });
            break;
          case 'NO_TEXT_CONTENT':
            setError({
              message: 'No readable text found in the PDF. The file might be scanned or image-based.',
              type: 'error'
            });
            break;
          default:
            setError({
              message: 'Could not read the PDF file. Please ensure it\'s not encrypted or corrupted.',
              type: 'error'
            });
        }
      } else if (error instanceof ContractAnalysisError) {
        switch (error.code) {
          case 'API_ERROR':
            setError({
              message: 'The AI service is currently unavailable. Please try again later.',
              type: 'error'
            });
            break;
          case 'INVALID_INPUT':
            setError({
              message: 'The document format is not supported. Please try a different file.',
              type: 'error'
            });
            break;
          case 'TEXT_PROCESSING_ERROR':
            setError({
              message: 'Error processing the document text. Please try a simpler document.',
              type: 'error'
            });
            break;
          default:
            setError({
              message: `An error occurred: ${error.message}. Please try again.`,
              type: 'error'
            });
        }
      } else {
        setError({
          message: 'An unexpected error occurred. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  const renderAnalysisSection = (title: string, items: string[] | undefined, icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6 px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
          {icon}
          {title}
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 tracking-tight text-gray-900 text-center">
          Don't Sign Until<br />You're Sure
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto text-center">
          Upload your contract, let AI highlight the risks and key terms.
        </p>
        <div 
          className={`p-8 border-2 border-dashed rounded-lg bg-white cursor-pointer transition-colors hover:bg-gray-50
            ${error?.type === 'error' ? 'border-red-300' : 'border-gray-300'}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleAreaClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleAreaClick()
            }
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <FileText className={`w-8 h-8 ${error?.type === 'error' ? 'text-red-500' : 'text-blue-500'}`} />
            <p className="text-lg text-gray-600">
              {file ? file.name : "Click or drop your contract here (PDF, DOCX)"}
            </p>
          </div>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
          />
        </div>

        <div className="flex justify-center mt-6">
          <Button
            variant={"default"}
            disabled={!file || isAnalyzing}
            onClick={handleAnalyze}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Contract
                <ArrowRight className="ml-2" />
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className={`mt-4 p-4 rounded-lg text-center flex items-center justify-center gap-2
            ${error.type === 'error' ? 'bg-red-50 border border-red-200 text-red-600' : 
                                     'bg-yellow-50 border border-yellow-200 text-yellow-600'}`}>
            {error.type === 'error' ? 
              <AlertTriangle className="w-5 h-5" /> : 
              <Clock className="w-5 h-5" />}
            {error.message}
          </div>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
            {/* Summary Section */}
            <div className="px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Analysis Summary</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Key Terms */}
            {renderAnalysisSection('Key Terms', analysis.keyTerms, 
              <CheckCircle className="w-5 h-5 text-blue-500" />)}

            {/* Potential Risks */}
            {renderAnalysisSection('Potential Risks', analysis.potentialRisks,
              <AlertTriangle className="w-5 h-5 text-red-500" />)}

            {/* Important Clauses */}
            {renderAnalysisSection('Important Clauses', analysis.importantClauses,
              <FileText className="w-5 h-5 text-gray-500" />)}

            {/* Recommendations */}
            {renderAnalysisSection('Recommendations', analysis.recommendations,
              <Clock className="w-5 h-5 text-green-500" />)}

            {/* Metadata */}
            {analysis.metadata && (
              <div className="px-6 py-4 bg-gray-50 rounded-lg text-sm text-gray-500 space-y-1">
                <p>Analysis completed on: {new Date(analysis.metadata.analyzedAt).toLocaleString()}</p>
                {analysis.metadata.totalChunks && (
                  <p>Document sections analyzed: {analysis.metadata.totalChunks}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
