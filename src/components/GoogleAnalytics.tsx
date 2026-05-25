import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

interface GoogleAnalyticsProps {
  gameState: 'opening' | 'title' | 'playing' | 'gameover';
}

export function GoogleAnalytics({ gameState }: GoogleAnalyticsProps) {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // 1. Dynamic Script Injection
  useEffect(() => {
    if (!measurementId) return;

    const scriptId = 'google-analytics-gtag';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: false, // Prevent duplicate automatic page view on script initialization
      });
    }
  }, [measurementId]);

  // 2. Track GameState Changes as Virtual Pageviews
  useEffect(() => {
    if (!measurementId || typeof window.gtag !== 'function') return;

    let pagePath = '/';
    let pageTitle = 'Grein Type — ユグドラシルの芽 —';

    switch (gameState) {
      case 'opening':
        pagePath = '/opening';
        pageTitle = 'Grein Type - Opening';
        break;
      case 'title':
        pagePath = '/title';
        pageTitle = 'Grein Type - World Tree Garden';
        break;
      case 'playing':
        pagePath = '/playing';
        pageTitle = 'Grein Type - Playing';
        break;
      case 'gameover':
        pagePath = '/gameover';
        pageTitle = 'Grein Type - Night Sky Memory (Result)';
        break;
      default:
        pagePath = '/';
        pageTitle = 'Grein Type — ユグドラシルの芽 —';
    }

    // Send page_view event to Google Analytics
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
    console.log(`[Analytics] Tracked pageview: ${pagePath} - ${pageTitle}`);
  }, [gameState, measurementId]);

  return null;
}
