/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_CONVEX_URL: string;
  readonly VITE_CONVEX_DEV_URL: string;
  readonly VITE_CONVEX_DEV_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
