import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const LegalDisclaimer = () => {
  return (
    <Alert variant="destructive" className="border-2 border-red-500 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
      <AlertTitle className="text-lg font-bold text-red-700 dark:text-red-400">Important Legal Notice</AlertTitle>
      <AlertDescription className="mt-2 text-red-600 dark:text-red-300">
        This AI-powered analysis is for informational purposes only and does not constitute legal advice. Always consult with a qualified legal professional before making any legal decisions.
      </AlertDescription>
    </Alert>
  );
};

export default LegalDisclaimer;