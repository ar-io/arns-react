/// <reference types="vite/client" />

// useful for intellisense to auto detect available env vars
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_SENTRY_DSN_PUBLIC_KEY: string;
  readonly VITE_SENTRY_DSN_PROJECT_URI: string;
  readonly VITE_SENTRY_DSN_PROJECT_ID: string;
  readonly VITE_ENVIRONMENT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
