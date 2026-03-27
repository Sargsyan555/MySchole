/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** VPS API origin when the site is hosted elsewhere (e.g. Vercel), e.g. https://1.2.3.4:3001 */
  readonly VITE_API_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
