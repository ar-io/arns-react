import { BrowserTracing } from '@sentry/browser';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const SENTRY_DSN_PUBLIC_KEY = import.meta.env.VITE_SENTRY_DSN_PUBLIC_KEY;
const SENTRY_DSN_PROJECT_URI = import.meta.env.VITE_SENTRY_DSN_PROJECT_URI;
const SENTRY_DSN_PROJECT_ID = import.meta.env.VITE_SENTRY_DSN_PROJECT_ID;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT ?? 'develop';

const sentry =
  SENTRY_DSN_PUBLIC_KEY && SENTRY_DSN_PROJECT_URI && SENTRY_DSN_PROJECT_ID
    ? Sentry.init({
        dsn: `https://${SENTRY_DSN_PUBLIC_KEY}@${SENTRY_DSN_PROJECT_URI}/${SENTRY_DSN_PROJECT_ID}`,
        integrations: [
          new BrowserTracing({
            routingInstrumentation: Sentry.reactRouterV6Instrumentation(
              useEffect,
              useLocation,
              useNavigationType,
              createRoutesFromChildren,
              matchRoutes,
            ),
          }),
        ],
        tracesSampleRate: 1.0,
        environment: ENVIRONMENT,
      })
    : {};

export default sentry;