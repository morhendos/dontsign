import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { trackUserInteraction } from '@/lib/analytics-events';
import type { ErrorDisplay } from '@/types/analysis';

interface FileUploadAreaProps {
  file: File | null;
  error: ErrorDisplay | null;
  onFileSelect: (file: File | null) => void;
}

export function FileUploadArea({ file, error, onFileSelect }: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    trackUserInteraction('file_drop');
    handleFileSelection(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    trackUserInteraction('file_select');
    handleFileSelection(selectedFile);
  };

  const handleAreaClick = () => {
    trackUserInteraction('upload_area_click');
    fileInputRef.current?.click();
  };

  const handleFileSelection = (selectedFile?: File) => {
    if (!selectedFile) {
      onFileSelect(null);
      return;
    }

    if (selectedFile.type !== 'application/pdf' && 
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      onFileSelect(null);
      return;
    }

    onFileSelect(selectedFile);
  };

  return (
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
          handleAreaClick();
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
  );
}