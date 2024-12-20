const CONSENT_KEY = 'cookieConsent';

export const getAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
};

export const setAnalyticsConsent = (consent: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, consent ? 'accepted' : 'declined');
};

export const clearAnalyticsConsent = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
};
