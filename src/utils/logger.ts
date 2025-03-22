import { Logger } from '@ar.io/sdk';
import { captureException, captureMessage } from '@sentry/react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, any>;

export class SentryLogger extends Logger {
  private context: LogContext = {};
  private component: string;
  private logLevel: LogLevel;

  constructor({
    component,
    initialContext = {},
    logLevel = 'info',
  }: {
    component: string;
    initialContext?: LogContext;
    logLevel?: LogLevel;
  }) {
    super({ level: logLevel });
    this.component = component;
    this.context = initialContext;
    this.logLevel = logLevel;
  }

  setContext(context: LogContext): SentryLogger {
    this.context = { ...this.context, ...context };
    return this;
  }

  withContext(context: LogContext): any {
    return new SentryLogger({
      component: this.component,
      initialContext: { ...this.context, ...context },
      logLevel: this.logLevel,
    });
  }

  warn(message: string, context?: LogContext): void {
    super.warn(message, context);
    // Also capture in Sentry as a warning
    captureMessage(message, {
      level: 'warning',
      tags: {
        component: this.component,
        logLevel: 'warn',
      },
      contexts: {
        logContext: { ...this.context, ...(context || {}) },
      },
    });
  }

  error(error: Error | string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    super.error(errorObj.message, context);

    // Capture in Sentry
    captureException(errorObj, {
      tags: {
        component: this.component,
        logLevel: 'error',
      },
      contexts: {
        logContext: { ...this.context, ...(context || {}) },
      },
    });
  }
}
