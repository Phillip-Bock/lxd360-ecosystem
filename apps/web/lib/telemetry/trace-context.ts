/**
 * Trace Context Utilities
 *
 * Helpers for extracting and propagating trace IDs through the application.
 * Supports both Google Cloud Trace and W3C Trace Context headers.
 *
 * This module is client-safe - the server-only `headers()` function is
 * dynamically imported only in `getTraceIdFromHeaders()`.
 *
 * @see https://cloud.google.com/trace/docs/setup
 * @see https://www.w3.org/TR/trace-context/
 */

/**
 * Trace context containing trace ID and optional span ID
 */
export interface TraceContext {
  /** The trace ID (32 hex characters) */
  traceId: string;
  /** The span ID (16 hex characters), if available */
  spanId?: string;
  /** Whether tracing is enabled for this request */
  sampled: boolean;
}

/**
 * GCP Project ID for trace URL formatting
 */
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'lxd-saas-dev';

/**
 * Parse Google Cloud Trace header
 * Format: TRACE_ID/SPAN_ID;o=TRACE_TRUE
 */
function parseCloudTraceHeader(header: string): TraceContext | null {
  const match = header.match(/^([a-f0-9]{32})(?:\/(\d+))?(?:;o=(\d))?$/i);
  if (!match) return null;
  return {
    traceId: match[1],
    spanId: match[2],
    sampled: match[3] === '1',
  };
}

/**
 * Parse W3C Trace Context traceparent header
 * Format: VERSION-TRACE_ID-PARENT_ID-FLAGS
 */
function parseTraceparentHeader(header: string): TraceContext | null {
  const parts = header.split('-');
  if (parts.length !== 4) return null;

  const [version, traceId, spanId, flags] = parts;
  if (version !== '00') return null;
  if (!/^[a-f0-9]{32}$/i.test(traceId)) return null;
  if (!/^[a-f0-9]{16}$/i.test(spanId)) return null;

  return {
    traceId,
    spanId,
    sampled: (Number.parseInt(flags, 16) & 0x01) === 1,
  };
}

/**
 * Get trace ID from incoming request headers (async version)
 * Use this in Server Components and Server Actions.
 * Note: This function can only be called on the server.
 */
export async function getTraceIdFromHeaders(): Promise<TraceContext | null> {
  // Dynamic import to keep this module client-safe
  const { headers } = await import('next/headers');
  const headerStore = await headers();

  const cloudTrace = headerStore.get('x-cloud-trace-context');
  if (cloudTrace) {
    const context = parseCloudTraceHeader(cloudTrace);
    if (context) return context;
  }

  const traceparent = headerStore.get('traceparent');
  if (traceparent) {
    const context = parseTraceparentHeader(traceparent);
    if (context) return context;
  }

  return null;
}

/**
 * Get trace ID from a headers object (sync version)
 * Use this when you already have the headers object, e.g., in middleware.
 */
export function getTraceIdFromHeadersSync(headersList: {
  get: (name: string) => string | null;
}): TraceContext | null {
  const cloudTrace = headersList.get('x-cloud-trace-context');
  if (cloudTrace) {
    const context = parseCloudTraceHeader(cloudTrace);
    if (context) return context;
  }

  const traceparent = headersList.get('traceparent');
  if (traceparent) {
    const context = parseTraceparentHeader(traceparent);
    if (context) return context;
  }

  return null;
}

/**
 * Format trace ID for Cloud Logging correlation
 * Cloud Logging requires traces in the format: projects/PROJECT_ID/traces/TRACE_ID
 */
export function formatTraceForLogging(traceId: string, projectId: string = PROJECT_ID): string {
  return `projects/${projectId}/traces/${traceId}`;
}

/**
 * Create a trace context for logging with Cloud Logging correlation
 */
export function createTraceContext(trace: TraceContext | null): Record<string, string> {
  if (!trace) return {};

  const context: Record<string, string> = {
    'logging.googleapis.com/trace': formatTraceForLogging(trace.traceId),
  };

  if (trace.spanId) {
    context['logging.googleapis.com/spanId'] = trace.spanId;
  }

  if (trace.sampled) {
    context['logging.googleapis.com/trace_sampled'] = 'true';
  }

  return context;
}
