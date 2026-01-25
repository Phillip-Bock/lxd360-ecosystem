/**
 * OpenTelemetry Configuration
 *
 * Implements Codex Section 5.1: Trace correlation across the stack.
 * Integrates with Google Cloud Trace for distributed tracing.
 */

export type { TraceContext } from './trace-context';
export {
  createTraceContext,
  formatTraceForLogging,
  getTraceIdFromHeaders,
  getTraceIdFromHeadersSync,
} from './trace-context';
