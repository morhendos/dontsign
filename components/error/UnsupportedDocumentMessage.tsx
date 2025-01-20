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
          Unsupported Document Type
          {documentType && ` (${documentType})`}
        </AlertTitle>
        <AlertDescription className="text-base">
          {explanation}
        </AlertDescription>
      </Alert>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-center">
          This tool is designed specifically for legal documents such as:
        </h3>
        <ul className="list-none space-y-2">
          <li className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Contracts and Agreements</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">•</span>
            <span>NDAs and Confidentiality Agreements</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Terms of Service</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Legal Policies and Procedures</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
