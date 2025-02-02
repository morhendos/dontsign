import { useState, useEffect } from 'react';

interface LegalAcknowledgment {
  timestamp: number;
  accepted: boolean;
}

export const useLegalAcknowledgment = () => {
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);

  useEffect(() => {
    // Load previous acknowledgment from localStorage
    try {
      const stored = localStorage.getItem('legal_acknowledgment');
      if (stored) {
        const acknowledgment: LegalAcknowledgment = JSON.parse(stored);
        setHasAccepted(acknowledgment.accepted);
      }
    } catch (error) {
      console.error('Error loading legal acknowledgment:', error);
    }
  }, []);

  const acceptDisclaimer = (accepted: boolean) => {
    try {
      const acknowledgment: LegalAcknowledgment = {
        timestamp: Date.now(),
        accepted
      };
      localStorage.setItem('legal_acknowledgment', JSON.stringify(acknowledgment));
      setHasAccepted(accepted);
    } catch (error) {
      console.error('Error saving legal acknowledgment:', error);
      setHasAccepted(accepted); // Still update state even if storage fails
    }
  };

  return {
    hasAccepted,
    acceptDisclaimer
  };
};

export default useLegalAcknowledgment;