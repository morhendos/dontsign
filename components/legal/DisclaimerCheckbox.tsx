import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';

interface DisclaimerCheckboxProps {
  onAccept: (accepted: boolean) => void;
  accepted: boolean;
}

export const DisclaimerCheckbox = ({
  onAccept,
  accepted
}: DisclaimerCheckboxProps) => {
  return (
    <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
      <div className="flex items-start space-x-3 p-2">
        <Checkbox
          id="disclaimer"
          checked={accepted}
          onCheckedChange={onAccept}
          className="mt-1"
        />
        <label
          htmlFor="disclaimer"
          className="text-sm text-blue-800 dark:text-blue-200 cursor-pointer"
        >
          I understand that this is an AI-powered analysis tool providing informational content only, not legal advice. Any decisions I make based on this analysis are my own responsibility, and I should consult with a qualified legal professional before making legal decisions.
        </label>
      </div>
    </Alert>
  );
};

export default DisclaimerCheckbox;