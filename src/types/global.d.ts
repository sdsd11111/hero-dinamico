// Global type declarations for Google Translate API
interface GoogleTranslateElement {
  new (options: any, elementId: string): any;
  InlineLayout: {
    SIMPLE: number;
  };
}

interface GoogleTranslate {
  translate: {
    TranslateElement: GoogleTranslateElement;
  };
}

declare global {
  interface Window {
    google?: GoogleTranslate;
    googleTranslateElementInit?: () => void;
  }
}

export {};
