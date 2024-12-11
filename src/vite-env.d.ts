/// <reference types="vite/client" />

// useful for intellisense to auto detect available env vars
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_SENTRY_DSN_PUBLIC_KEY: string;
  readonly VITE_SENTRY_DSN_PROJECT_URI: string;
  readonly VITE_SENTRY_DSN_PROJECT_ID: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_GITHUB_HASH: string;
  readonly VITE_ARWEAVE_HOST: string;
  readonly VITE_ARNS_SERVICE_API: string;
  readonly VITE_ARNS_REGISTRY_ADDRESS: string;
  readonly VITE_ARIO_PROCESS_ID: string;
  readonly VITE_AO_CU_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
