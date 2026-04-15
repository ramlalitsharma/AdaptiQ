/**
 * Centralized Logging Utility
 * Provides structured logging with levels and context
 * Integrates with OpenTelemetry/Jaeger for error tracking
 */

import { captureError } from './otel-instrumentation';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    context?: LogContext,
  ): void {
    if (level < this.minLevel) return;

    const formatted = this.formatMessage(levelName, message, context);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        // Track as breadcrumb/span event in OTEL if needed
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, "DEBUG", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, "INFO", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, "WARN", message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };

    this.log(LogLevel.ERROR, "ERROR", message, errorContext);

    // Capture in OpenTelemetry
    const err = error instanceof Error ? error : new Error(message);
    captureError(err, { logMessage: message, ...context });
  }

  // Convenience method for API requests
  request(
    method: string,
    path: string,
    statusCode: number,
    duration?: number,
  ): void {
    this.info(`${method} ${path}`, {
      statusCode,
      ...(duration && { duration: `${duration}ms` }),
    });
  }

  // Convenience method for database operations
  database(operation: string, collection: string, duration?: number): void {
    this.debug(`DB ${operation}`, {
      collection,
      ...(duration && { duration: `${duration}ms` }),
    });
  }

  // Method to capture exceptions with context
  captureException(error: Error, context?: LogContext): void {
    this.error("Exception captured", error, context);
  }

  // Method to capture messages with context
  captureMessage(
    message: string,
    level: LogLevel = LogLevel.INFO,
    context?: LogContext,
  ): void {
    this.log(level, LogLevel[level], message, context);
  }

  // Method to add breadcrumb for debugging
  addBreadcrumb(message: string, data?: any, category?: string): void {
    // OTEL can store these as span events
    console.log(`[BREADCRUMB] [${category || 'custom'}] ${message}`, data);
  }

  // Method to set user context
  setUser(userId: string, email?: string, username?: string): void {
    // Set as global OTEL attributes or PostHog identification
    console.log(`[USER_CONTEXT] Identification set for ${userId}`);
  }

  // Method to clear user context
  clearUser(): void {
    console.log(`[USER_CONTEXT] Context cleared`);
  }
}

export const logger = new Logger();
