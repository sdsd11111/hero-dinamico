'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Establecer el idioma guardado o el predeterminado (solo en cliente)
    try {
      const savedLang = localStorage.getItem('preferredLanguage') || 'es';
      if (savedLang !== i18n.language) {
        i18n.changeLanguage(savedLang);
      }
    } catch {
      // localStorage puede no estar disponible en algunos navegadores/modos privados
    }
  }, []);

  // Renderizar children SIEMPRE para evitar pantalla en blanco durante hidratación
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
