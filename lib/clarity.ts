declare global {
  interface Window {
    clarity?: (method: string, ...args: any[]) => void;
  }
}

export const initClarity = (clarityId: string): void => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;
    
    // Add error handling
    script.onerror = (error) => {
      console.error('Error loading Clarity:', error);
    };

    if (document.head) {
      document.head.appendChild(script);
    }
  }
};

export const trackEvent = (eventName: string, metadata?: Record<string, any>): void => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName, metadata);
  }
};
