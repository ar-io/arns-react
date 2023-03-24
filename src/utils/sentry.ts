import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

const SENTRY_DSN_PUBLIC_KEY = import.meta.env.VITE_SENTRY_DSN_PUBLIC_KEY;
const SENTRY_DSN_PROJECT_URI = import.meta.env.VITE_SENTRY_DSN_PROJECT_URI;
const SENTRY_DSN_PROJECT_ID = import.meta.env.VITE_SENTRY_DSN_PROJECT_ID;

export default function setupSentry() {
  if (
    SENTRY_DSN_PUBLIC_KEY &&
    SENTRY_DSN_PROJECT_URI &&
    SENTRY_DSN_PROJECT_ID
  ) {
    console.debug('Setting up Sentry monitoring.');
    Sentry.init({
      dsn: `https://${SENTRY_DSN_PUBLIC_KEY}@${SENTRY_DSN_PROJECT_URI}/${SENTRY_DSN_PROJECT_ID}`,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.VITE_ENVIRONMENT ?? 'develop',
    });
  }
}
