export const GA_MEASUREMENT_ID = 'G-Z8DHSQJP02';
export const CLARITY_PROJECT_ID = 'xsg3ynkf4o';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a page_view event to GA4 for SPA route changes.
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
};

/**
 * Sends a custom event to Google Analytics 4.
 */
export const trackEvent = (
  action: string,
  category?: string,
  label?: string,
  value?: number,
  params?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
};
