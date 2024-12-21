'use client'

// ... (previous imports and interfaces remain the same)

export default function Hero() {
  // ... (previous code remains the same until the return statement)

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
              {file ? (
                <span className="hover:text-blue-400 transition-colors duration-200">
                  {file.name}
                </span>
              ) : (
                "Click or drop your contract here (PDF, DOCX)"
              )}
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

        // ... (rest of the code remains exactly the same)