'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { analyzeContract } from '@/app/actions'
import { readPdfText } from '@/lib/pdf-utils'

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
        throw new Error('No analysis result received');
      }
    } catch (error) {
      console.error('Error analyzing contract:', error);
      if (error instanceof Error) {
        if (error.message.includes('Could not read PDF file')) {
          setError('Could not read the PDF file. Please make sure it\'s not encrypted or corrupted.');
        } else if (error.message.includes('OpenAI API key is not configured')) {
          setError('The AI service is currently unavailable. Please try again later or contact support.');
        } else {
          setError(`An error occurred: ${error.message}. Please try again.`);
        }
      } else {
        setError('An unknown error occurred. Please try again.');
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
          className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white cursor-pointer transition-colors hover:bg-gray-50"
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

        <div className="flex justify-center mt-6">
          <Button
            variant={"default"}
            disabled={!file || isAnalyzing}
            onClick={handleAnalyze}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" />
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
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
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
