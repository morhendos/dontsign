declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// GA configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Type definitions for GA events
interface GAEvent {
  action: string;
  category: string;
  label: string;
  value?: number;
}

// Validation and debug utilities
const isValidMeasurementId = (id?: string): boolean => {
  return !!id && /^G-[A-Z0-9]+$/.test(id);
};

const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`[GA Debug] ${message}`, data || '');
  }
};

// Initialize GA with error handling
export const initGA = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  if (!isValidMeasurementId(GA_MEASUREMENT_ID)) {
    console.error('[GA Error] Invalid or missing Measurement ID');
    return Promise.reject(new Error('Invalid GA Measurement ID'));
  }

  if (window.gtag) {
    debugLog('GA already initialized');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: window.location.pathname,
          debug_mode: DEBUG_MODE
        });

        debugLog('GA initialized successfully');
        resolve();
      };

      script.onerror = (error) => {
        console.error('[GA Error] Failed to load GA script:', error);
        reject(error);
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('[GA Error] Failed to initialize GA:', error);
      reject(error);
    }
  });
};

// Page view tracking with error handling
export const pageview = (url: string): void => {
  try {
    if (!window.gtag) {
      debugLog('Skipping pageview - GA not initialized');
      return;
    }

    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_path: url,
    });

    debugLog('Pageview tracked', url);
  } catch (error) {
    console.error('[GA Error] Failed to track pageview:', error);
  }
};

// Event tracking with error handling
export const event = ({ action, category, label, value }: GAEvent): void => {
  try {
    if (!window.gtag) {
      debugLog('Skipping event - GA not initialized');
      return;
    }

    const eventData = {
      event_category: category,
      event_label: label,
      value: value,
    };

    window.gtag('event', action, eventData);
    debugLog('Event tracked', { action, ...eventData });
  } catch (error) {
    console.error('[GA Error] Failed to track event:', error);
  }
};

// Utility function to check if GA is initialized
export const isGAInitialized = (): boolean => {
  return typeof window !== 'undefined' && !!window.gtag;
};