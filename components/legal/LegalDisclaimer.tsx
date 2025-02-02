import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LegalDisclaimer = () => {
  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="border-2 border-red-500 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
        <AlertTitle className="text-lg font-bold text-red-700 dark:text-red-400">Important Legal Notice</AlertTitle>
        <AlertDescription className="mt-2 text-red-600 dark:text-red-300">
          This AI-powered analysis is for informational purposes only and does not constitute legal advice. Always consult with a qualified legal professional before making any legal decisions.
        </AlertDescription>
      </Alert>
      
      <Card className="bg-slate-50 dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle>Understanding Your Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>By using this service, you acknowledge and agree that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The analysis is generated by artificial intelligence and may contain errors or omissions</li>
            <li>We do not guarantee the accuracy, completeness, or reliability of the analysis</li>
            <li>This tool is designed to assist, not replace, professional legal review</li>
            <li>We are not responsible for any decisions made based on the analysis</li>
            <li>The service does not create an attorney-client relationship</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalDisclaimer;