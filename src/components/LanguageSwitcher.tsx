'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, X } from 'lucide-react';

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');
  const [isOpen, setIsOpen] = useState(false);
  const initRef = useRef(false);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  // Cargar idioma guardado
  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'en') {
      setCurrentLang('en');
      document.documentElement.lang = 'en';
    }
  }, []);

  // Inyectar CSS para ocultar Google Translate
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-gadget, .goog-te-banner-frame, .goog-te-menu-value,
      .goog-te-gadget-simple, .goog-te-gadget-icon, .goog-logo-link,
      .skiptranslate, .goog-te-combo, iframe, .goog-te-balloon {
        display: none !important;
      }
      body { top: 0 !important; }
      #google_translate_element { position: absolute; left: -9999px; }
    `;
    document.head.appendChild(style);
    
    // Función de limpieza corregida
    return () => {
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Inicializar Google Translate
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Definir callback ANTES del script
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'es',
          includedLanguages: 'en,es',
          autoDisplay: false,
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );

      // Esperar a que el select esté listo
      const checkSelect = setInterval(() => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          selectRef.current = select;
          clearInterval(checkSelect);

          // Aplicar idioma guardado
          const saved = localStorage.getItem('preferredLanguage');
          if (saved === 'en') {
            changeLanguage('en');
          }
        }
      }, 100);
    };

    // Contenedor oculto
    const container = document.createElement('div');
    container.id = 'google_translate_element';
    document.body.appendChild(container);

    // Cargar script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Cambiar idioma SIN recargar
  const changeLanguage = (lang: 'es' | 'en') => {
    if (currentLang === lang) return;

    setCurrentLang(lang);
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.lang = lang;

    const applyTranslation = () => {
      if (selectRef.current) {
        selectRef.current.value = lang;
        selectRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // Reintento hasta que aparezca
        setTimeout(applyTranslation, 100);
      }
    };

    applyTranslation();
  };

  return (
    <div className="fixed top-24 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border border-gray-200"
        aria-label="Cambiar idioma"
      >
        <Globe size={20} />
        <span className="font-medium text-sm">{currentLang.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 bg-white rounded-lg shadow-xl p-2 min-w-[120px] border border-gray-200">
          <button
            onClick={() => {
              changeLanguage('es');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center justify-between text-sm ${
              currentLang === 'es' ? 'font-bold text-blue-600' : 'text-gray-700'
            }`}
          >
            Español {currentLang === 'es' && '✓'}
          </button>
          <button
            onClick={() => {
              changeLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center justify-between text-sm ${
              currentLang === 'en' ? 'font-bold text-blue-600' : 'text-gray-700'
            }`}
          >
            English {currentLang === 'en' && '✓'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
