/// <reference types="vite/client" />
export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY?: string;
    // add other VITE_... keys here as needed
    [key: string]: string | boolean | undefined;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
