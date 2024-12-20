-100">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Analysis Summary</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{analysis.summary}</p>
            </div>

            {renderAnalysisSection('Key Terms', analysis.keyTerms, 
              <CheckCircle className="w-5 h-5 text-blue-500" />)}

            {renderAnalysisSection('Potential Risks', analysis.potentialRisks,
              <AlertTriangle className="w-5 h-5 text-red-500" />)}

            {renderAnalysisSection('Important Clauses', analysis.importantClauses,
              <FileText className="w-5 h-5 text-gray-500" />)}

            {renderAnalysisSection('Recommendations', analysis.recommendations,
              <Clock className="w-5 h-5 text-green-500" />)}

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