// Type definitions for Google Translate API
declare namespace google {
  namespace translate {
    const TranslateElement: {
      new (options: any, elementId: string): any;
      InlineLayout: {
        SIMPLE: number;
      };
    };
  }
}

declare global {
  interface Window {
    google: typeof google;
    googleTranslateElementInit: () => void;
  }
}

export {};
