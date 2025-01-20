import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileX } from 'lucide-react';

interface UnsupportedDocumentMessageProps {
  documentType?: string;
  explanation: string;
}

export function UnsupportedDocumentMessage({
  documentType,
  explanation
}: UnsupportedDocumentMessageProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Alert variant="destructive" className="border-2">
        <FileX className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold mb-2">
          Cannot Analyze Document
        </AlertTitle>
        <AlertDescription className="text-base">
          {documentType 
            ? `This appears to be a ${documentType}: ${explanation}`
            : explanation
          }
        </AlertDescription>
      </Alert>

      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-center mb-4">
          This tool analyzes legal documents such as contracts, NDAs, terms of service, and other legal agreements.
        </h3>
      </div>
    </div>
  );
}
