import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DisclaimerCheckboxProps {
  onAccept: (accepted: boolean) => void;
  accepted: boolean;
}

export const DisclaimerCheckbox: React.FC<DisclaimerCheckboxProps> = ({ onAccept, accepted }) => {
  return (
    <div className="flex items-center space-x-2 p-4 border rounded bg-slate-50">
      <Checkbox
        id="disclaimer"
        checked={accepted}
        onCheckedChange={onAccept}
      />
      <Label
        htmlFor="disclaimer"
        className="text-sm text-gray-700"
      >
        I acknowledge that this is not legal advice and I should consult with a qualified legal professional before making any decisions based on this analysis.
      </Label>
    </div>
  );
};

export default DisclaimerCheckbox;