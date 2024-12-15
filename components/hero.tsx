'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2 } from 'lucide-react'
import { analyzeContract } from '@/app/actions'

export default function Hero() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
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
          <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
        </div>
      )}
    </section>
  )
}

