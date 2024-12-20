declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * @fileoverview Google Analytics 4 implementation
 * This module provides type-safe GA4 tracking functionality with error handling
 * and debug capabilities. It's designed to work with Next.js App Router and
 * handles cookie consent requirements.
 *
 * @see /docs/analytics.md for detailed documentation
 */

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

/**
 * Initializes Google Analytics 4
 * @returns Promise<void>
 * @throws Error if initialization fails
 */
export const initGA = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  if (!isValidMeasurementId(GA_MEASUREMENT_ID)) {
    console.error('[GA Error] Invalid or missing Measurement ID');
    return Promise.reject(new Error('Invalid GA Measurement ID'));
  }

  if (typeof window.gtag === 'function') {
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
          window.dataLayer!.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID!, {
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

/**
 * Tracks page views in GA4
 * @param url - The URL to track
 */
export const pageview = (url: string): void => {
  try {
    if (typeof window.gtag !== 'function') {
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

/**
 * Tracks custom events in GA4
 * @param event - The event object containing action, category, label, and optional value
 */
export const event = ({ action, category, label, value }: GAEvent): void => {
  try {
    if (typeof window.gtag !== 'function') {
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

/**
 * Checks if GA4 is initialized
 * @returns boolean indicating if GA is initialized
 */
export const isGAInitialized = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};