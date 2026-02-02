/**
 * Centralized error handling utility with OpenTelemetry integration
 * Replaces legacy Sentry integration with open-source tracing
 */

import { NextResponse } from "next/server";
import { captureError } from "./otel-instrumentation";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Create a standardized error response with OpenTelemetry integration
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = "An error occurred",
  statusCode = 500,
): NextResponse {
  const isDev = process.env.NODE_ENV === "development";

  // Don't expose internal errors in production
  let message = defaultMessage;
  let details: any = undefined;

  if (error instanceof Error) {
    // Only expose error messages in development
    if (isDev) {
      message = error.message || defaultMessage;
      details = {
        stack: error.stack,
        name: error.name,
      };
    }

    // Handle specific error types
    if ("statusCode" in error && typeof error.statusCode === "number") {
      statusCode = error.statusCode;
    }

    // Handle known error codes
    if ("code" in error) {
      const code = String(error.code);

      // MongoDB errors
      if (code === "11000") {
        message = "Duplicate entry";
        statusCode = 409;
      } else if (code === "ENOTFOUND" || code === "ECONNREFUSED") {
        message = "Database connection error";
        statusCode = 503;
      }
    }
  }

  // Capture in OpenTelemetry and PostHog for server-side errors
  if (statusCode >= 500) {
    captureError(error, {
      type: "api_error",
      statusCode: statusCode.toString(),
      message,
      defaultMessage,
    });

    // Also log to PostHog for funnel impact analysis if we're in a context that allows it
    // (Note: Server-side PostHog usually requires posthog-node, but we can track via event if needed)
  } else if (statusCode >= 400) {
    // Log client errors as warnings in traces
    captureError(error, {
      type: "client_error",
      severity: "warning",
      statusCode: statusCode.toString(),
    });
  }

  // Log error locally for debugging
  if (statusCode >= 500) {
    console.error("Server error:", error);
  } else if (statusCode >= 400) {
    console.warn("Client error:", error);
  }

  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      ...(isDev && { timestamp: new Date().toISOString() }),
    },
    { status: statusCode },
  );
}

/**
 * Create success response with consistent format
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode = 200,
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      data,
    },
    { status: statusCode },
  );
}

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  request: Request,
  validator: (body: any) => body is T,
): Promise<{ valid: true; data: T } | { valid: false; error: NextResponse }> {
  try {
    const body = await request.json();

    if (!validator(body)) {
      return {
        valid: false,
        error: createErrorResponse(
          new Error("Invalid request body"),
          "Invalid request data",
          400,
        ),
      };
    }

    return { valid: true, data: body };
  } catch (error) {
    // Log validation errors
    captureError(error, {
      type: "validation_error",
      severity: "warning"
    });

    return {
      valid: false,
      error: createErrorResponse(error, "Invalid JSON in request body", 400),
    };
  }
}

/**
 * Check if error is operational (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof Error && "isOperational" in error) {
    return (error as AppError).isOperational === true;
  }
  return false;
}

/**
 * Async error wrapper for API routes
 */
export function asyncHandler(
  fn: (req: Request, context?: any) => Promise<NextResponse>,
) {
  return async (req: Request, context?: any) => {
    try {
      return await fn(req, context);
    } catch (error) {
      return createErrorResponse(error, "An unexpected error occurred", 500);
    }
  };
}

/**
 * Create error with status code
 */
export function createAppError(
  message: string,
  statusCode = 400,
  code?: string,
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack}`;
  }
  return String(error);
}

/**
 * Track error metrics
 */
export function trackErrorMetric(
  errorType: string,
  severity: "low" | "medium" | "high" | "critical",
  metadata?: Record<string, any>,
): void {
  captureError(new Error(`Error Metric: ${errorType}`), {
    errorType,
    severity,
    ...metadata
  });
}

/**
 * Create context for error tracking
 */
export function setErrorContext(
  userId?: string,
  requestId?: string,
  metadata?: Record<string, any>,
): void {
  // Context is now handled via span attributes in lib/otel-instrumentation.ts
  // or by identifying the user in PostHog
  console.log(`[ERROR_CONTEXT] userId: ${userId}, requestId: ${requestId}`, metadata);
}
