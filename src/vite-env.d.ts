/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional. When set (e.g. on Vercel), API base is `${VITE_API_ORIGIN}/api` instead of same-origin `/api`. */
  readonly VITE_API_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
