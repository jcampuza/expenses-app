/// <reference types="vite/client" />
/// <reference types="filesystem-routing/types" />
/// <reference types="@solidjs/vite-plugin/boundary-modules" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
