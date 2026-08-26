/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_BUILD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __VITE_PUBLIC_BUILD__: boolean;
