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
const IS_PERMAWEB_VERSION = import.meta.env.VITE_ARNS_NAME !== undefined;

const sentry =
  SENTRY_DSN_PUBLIC_KEY &&
  SENTRY_DSN_PROJECT_URI &&
  SENTRY_DSN_PROJECT_ID &&
  !IS_PERMAWEB_VERSION
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
          Sentry.httpClientIntegration({
            failedRequestStatusCodes: [
              [400, 499],
              [500, 599],
            ],
            failedRequestTargets: [
              'localhost',
              '127.0.0.1',
              /\.ao-testnet\.xyz$/i,
              'https://cu.ardrive.io',
            ],
          }),
        ],
        tracesSampleRate: 1.0,
        environment: ENVIRONMENT,
        beforeSend(event) {
          if (shouldFilterEvent(event)) {
            return null;
          }
          return sanitizeEvent(event);
        },
        beforeSendTransaction(event) {
          if (shouldFilterEvent(event)) {
            return null;
          }
          return sanitizeEvent(event);
        },
      })
    : {};

export default sentry;

const filterMessages = new Set(['Cannot redefine property: ethereum']);

const shouldFilterEvent = (event: Sentry.Event): boolean => {
  const isFiltered = [...filterMessages].some((message) =>
    event.exception?.values?.some((value) =>
      value.value?.toLowerCase().includes(message.toLowerCase()),
    ),
  );

  return isFiltered;
};

const sanitizeEvent = (event: Sentry.Event): Sentry.Event | null => {
  // Remove user's IP address
  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers['X-Forwarded-For'];
    }
    if (event.request.env) {
      delete event.request.env['REMOTE_ADDR'];
    }
  }

  // Remove user details
  if (event.user) {
    delete event.user; // Remove user object
  }

  return event;
};
