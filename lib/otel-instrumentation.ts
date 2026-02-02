import * as api from '@opentelemetry/api';
import { logger } from './logger';

const tracer = api.trace.getTracer('adaptiq-lms', '1.0.0');

/**
 * Capture error with OpenTelemetry
 */
export function captureError(error: Error | any, context?: Record<string, any>) {
    const span = tracer.startSpan('error.capture');

    const err = error instanceof Error ? error : new Error(String(error));

    try {
        span.setAttributes({
            'error.type': err.name,
            'error.message': err.message,
            'error.stack': err.stack,
            ...context,
        });

        span.setStatus({ code: api.SpanStatusCode.ERROR });
        span.recordException(err);

        // Log locally for immediate feedback
        logger.error(`[OTEL] ${err.message}`, err, context);
    } finally {
        span.end();
    }
}

/**
 * Track operation performance
 */
export function trackSpan<T>(name: string, fn: (span: api.Span) => Promise<T>, attributes?: Record<string, any>): Promise<T> {
    return tracer.startActiveSpan(name, async (span) => {
        if (attributes) {
            span.setAttributes(attributes);
        }
        try {
            const result = await fn(span);
            span.setStatus({ code: api.SpanStatusCode.OK });
            return result;
        } catch (error: any) {
            span.setStatus({ code: api.SpanStatusCode.ERROR, message: error.message });
            span.recordException(error);
            throw error;
        } finally {
            span.end();
        }
    });
}

export default {
    tracer,
    captureError,
    trackSpan,
};
