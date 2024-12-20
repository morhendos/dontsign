'use client';

import { useEffect, useState } from 'react';
import { initGA, pageview } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { CookieConsent } from './CookieConsent';
import { getAnalyticsConsent, setAnalyticsConsent } from '@/lib/analytics-consent';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  // Initialize GA if consent is given
  useEffect(() => {
    const initializeGA = async () => {
      if (!getAnalyticsConsent()) return;

      try {
        await initGA();
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize GA:', error);
      }
    };

    initializeGA();
  }, []);

  // Track page views
  useEffect(() => {
    if (!initialized) return;

    const url = pathname + searchParams.toString();
    pageview(url);
  }, [pathname, searchParams, initialized]);

  const handleAcceptCookies = async () => {
    setAnalyticsConsent(true);
    if (!initialized) {
      try {
        await initGA();
        setInitialized(true);
        // Track initial pageview after delayed initialization
        pageview(pathname + searchParams.toString());
      } catch (error) {
        console.error('Failed to initialize GA after consent:', error);
      }
    }
  };

  const handleDeclineCookies = () => {
    setAnalyticsConsent(false);
  };

  return (
    <CookieConsent
      onAccept={handleAcceptCookies}
      onDecline={handleDeclineCookies}
    />
  );
}
