'use client';

import { useEffect, useRef } from 'react';

export default function GoogleTranslate() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    // Verificar si ya existe el script
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (existingScript) return;

    // Crear el div para el widget
    const googleTranslateElement = document.createElement('div');
    googleTranslateElement.id = 'google_translate_element';
    googleTranslateElement.style.display = 'none';
    document.body.appendChild(googleTranslateElement);

    // Función para inicializar Google Translate
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'es',
            includedLanguages: 'en,es',
            autoDisplay: false,
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      }
    };

    // Cargar el script de Google Translate
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = (error) => {
      console.error('Error al cargar Google Translate:', error);
    };
    document.body.appendChild(script);

    initialized.current = true;

    // Limpieza
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (googleTranslateElement.parentNode) {
        googleTranslateElement.parentNode.removeChild(googleTranslateElement);
      }
      delete (window as any).googleTranslateElementInit;
    };
  }, []);

  return null;
}
