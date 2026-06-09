/// <reference types="vite/client" />

interface Window {
  cetakdocs?: {
    platform: string;
    isElectron: boolean;
    getVersion: () => Promise<string>;
    getApiPort: () => Promise<number>;
    secureStore: {
      set: (key: string, value: string) => Promise<boolean>;
      get: (key: string) => Promise<string | null>;
      delete: (key: string) => Promise<boolean>;
    };
    print: () => Promise<boolean>;
  };
}
