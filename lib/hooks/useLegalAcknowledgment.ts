import { useState } from 'react';

interface UseLegalAcknowledgmentProps {
  documentId?: string | null; // Unique identifier for the current document
}

export const useLegalAcknowledgment = ({ documentId }: UseLegalAcknowledgmentProps = {}) => {
  // Simple state without localStorage persistence
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);

  // Reset acceptance when documentId changes
  useEffect(() => {
    setHasAccepted(false);
  }, [documentId]);

  const acceptDisclaimer = (accepted: boolean) => {
    setHasAccepted(accepted);
  };

  return {
    hasAccepted,
    acceptDisclaimer
  };
};

export default useLegalAcknowledgment;