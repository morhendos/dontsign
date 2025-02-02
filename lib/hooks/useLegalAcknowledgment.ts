import { useState, useEffect } from 'react';

interface LegalAcknowledgment {
  timestamp: number;
  accepted: boolean;
}

export const useLegalAcknowledgment = () => {
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);

  useEffect(() => {
    // Load previous acknowledgment from localStorage
    const stored = localStorage.getItem('legal_acknowledgment');
    if (stored) {
      const acknowledgment: LegalAcknowledgment = JSON.parse(stored);
      setHasAccepted(acknowledgment.accepted);
    }
  }, []);

  const acceptDisclaimer = (accepted: boolean) => {
    const acknowledgment: LegalAcknowledgment = {
      timestamp: Date.now(),
      accepted
    };
    localStorage.setItem('legal_acknowledgment', JSON.stringify(acknowledgment));
    setHasAccepted(accepted);
  };

  return {
    hasAccepted,
    acceptDisclaimer
  };
};

export default useLegalAcknowledgment;