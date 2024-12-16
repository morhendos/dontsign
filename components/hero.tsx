'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { analyzeContract } from '@/app/actions'

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

export default function Hero() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(droppedFile)
      setAnalysis(null)
      setError(null)
    } else {
      setError('Please upload a PDF or DOCX file.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(selectedFile)
      setAnalysis(null)
      setError(null)
    } else {
      setError('Please select a PDF or DOCX file.')
    }
  }

  const handleAreaClick = () => {
    fileInputRef.current?.click()
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a file before analyzing.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await analyzeContract(formData)
      if (result) {
        setAnalysis(result)
      } else {
        throw new Error('No analysis result received')
      }
    } catch (error) {
      console.error('Error analyzing contract:', error)
      if (error instanceof Error && error.message.includes('OpenAI API key is not configured')) {
        setError('The AI service is currently unavailable. Please try again later or contact support.')
      } else {
        setError(`An error occurred while analyzing the contract: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderAnalysisSection = (title: string, items: string[] | undefined, icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
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
    <section className="py-20 px-4 text-center">
      <h1 className="text-5xl font-bold mb-6 tracking-tight text-gray-900">
        Don't Sign Until<br />You're Sure.
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Upload your contract, let AI highlight the risks and key terms.
      </p>
      <div 
        className="max-w-3xl mx-auto p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white cursor-pointer transition-colors hover:bg-gray-50"
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
          <FileText className="w-8 h-8 text-blue-500" />
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
      <Button 
        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white"
        disabled={!file || isAnalyzing}
        onClick={handleAnalyze}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            Analyse
            <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
      {error && (
        <div className="mt-4 text-red-500">{error}</div>
      )}
      {analysis && (
        <div className="mt-8 max-w-3xl mx-auto text-left bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Contract Analysis</h2>
          
          {/* Summary Section */}
          <div className="mb-6">
            <p className="text-gray-700">{analysis.summary}</p>
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
            <div className="mt-6 pt-4 border-t text-sm text-gray-500">
              <p>Analyzed on: {new Date(analysis.metadata.analyzedAt).toLocaleDateString()}</p>
              {analysis.metadata.totalChunks && (
                <p>Document sections analyzed: {analysis.metadata.totalChunks}</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
