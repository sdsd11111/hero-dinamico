'use client';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Evita que Font Awesome agregue estilos por defecto
config.autoAddCss = false;

export function FontAwesomeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
