'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useCallback } from 'react';

/**
 * LESYA PIXEL HOOK
 * Manages client-side Meta Pixel events with built-in consent check.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Helper to get current consent status
const getConsent = () => {
  if (typeof window === 'undefined') return 'denied';
  return localStorage.getItem('lesya_cookie_consent') || 'denied';
};

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export function usePixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initialize Pixel (Only if granted)
  const initPixel = useCallback(() => {
    if (!PIXEL_ID || getConsent() !== 'granted' || typeof window === 'undefined' || window.fbq) return;

    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
    console.log('[Pixel] Initialized and PageView tracked.');
  }, []);

  // 2. Track PageView on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq && getConsent() === 'granted') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  // 3. Listen for consent changes
  useEffect(() => {
    const handleConsentChange = () => {
      console.log('[Pixel] Consent change detected.');
      initPixel();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cookie-consent-change', handleConsentChange);
      initPixel(); // Check on mount
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cookie-consent-change', handleConsentChange);
      }
    };
  }, [initPixel]);

  /**
   * Track Custom Events (ViewContent, AddToCart, etc.)
   * @param eventName Meta Standard Event Name
   * @param data Custom Data Payload
   * @param eventId Deduplication ID (Crucial!)
   */
  const track = (eventName: string, data?: object, eventId?: string) => {
    if (typeof window === 'undefined' || !window.fbq || getConsent() !== 'granted') return;

    if (eventId) {
      window.fbq('track', eventName, data, { event_id: eventId });
    } else {
      window.fbq('track', eventName, data);
    }
    
    console.log(`[Pixel] Event Tracked: ${eventName}`, { data, eventId });
  };

  return { track };
}
