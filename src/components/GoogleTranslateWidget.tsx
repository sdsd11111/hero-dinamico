'use client';

import { useEffect, useRef } from 'react';

// Extend Window interface for Google Translate
declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: {
          new (options: any, elementId: string): any;
          InlineLayout: {
            SIMPLE: number;
          };
        };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export default function GoogleTranslateWidget() {
  const initialized = useRef(false);
  const widgetInitialized = useRef(false);
  const translateElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized.current || typeof document === 'undefined') return;
    initialized.current = true;

    // Create the widget container if it doesn't exist
    if (!translateElementRef.current) {
      const container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.display = 'none';
      document.body.appendChild(container);
      translateElementRef.current = container;
    }

    // Remove any existing script
    const existingScript = document.getElementById('google-translate-script');
    if (existingScript?.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }

    // Remove any existing iframe
    const existingIframe = document.querySelector('.goog-te-banner-frame');
    if (existingIframe?.parentNode) {
      existingIframe.parentNode.removeChild(existingIframe);
    }

    // Create a new script element
    const addScript = () => {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      script.onload = () => {
        console.log('Google Translate script loaded');
      };
      
      script.onerror = (error) => {
        console.error('Error loading Google Translate:', error);
      };

      document.body.appendChild(script);
      return script;
    };

    // Initialize the widget
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate || widgetInitialized.current) return;
      
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'es',
            includedLanguages: 'en,es',
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
        
        console.log('Google Translate widget initialized');
        widgetInitialized.current = true;
        
        // Set initial language from localStorage
        const savedLang = localStorage.getItem('preferredLanguage') || 'es';
        if (savedLang) {
          const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
          if (select && select.value !== savedLang) {
            select.value = savedLang;
            select.dispatchEvent(new Event('change'));
          }
        }
      } catch (error) {
        console.error('Error initializing Google Translate widget:', error);
      }
    };

    // Add the script
    const script = addScript();

    // Cleanup function
    return () => {
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      if (translateElementRef.current?.parentNode) {
        translateElementRef.current.parentNode.removeChild(translateElementRef.current);
      }
      
      const iframe = document.querySelector('.goog-te-banner-frame');
      if (iframe?.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      
      delete window.googleTranslateElementInit;
    };
  }, []);

  return null; // We don't need to render anything
}
