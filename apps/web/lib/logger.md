# Production Logger

## Overview

GCP Cloud Logging compatible structured logger for the LXD360 platform.

## Features

- **GCP Compatible**: Outputs structured JSON with `severity` field in production
- **Developer Friendly**: Colorized, human-readable output in development
- **Request Tracing**: Trace ID support for request correlation
- **Zero Dependencies**: Uses native console and JSON only
- **Type Safe**: Full TypeScript support

## Usage

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

logger.debug('Detailed debug info', { data: value });
logger.info('General information', { userId: '123' });
logger.warn('Warning condition', { threshold: 90 });
logger.error('Error occurred', error, { context: 'api' });
logger.critical('System failure', error);
```

### Scoped Logger

```typescript
const log = logger.scope('PaymentService');
log.info('Processing payment', { amount: 100 });
```

### Request Tracing

```typescript
// In API route or middleware
const traceId = request.headers.get('x-trace-id') || crypto.randomUUID();
const log = logger.withTraceId(traceId);

log.info('Request received', { method: 'POST', path: '/api/users' });
// All subsequent logs include the trace ID for correlation
```

### Child Logger

```typescript
const log = logger.child({
  module: 'OrderService',
  traceId: 'abc-123',
  customField: 'value',
});
```

## Environment Variables

| Variable    | Default                      | Description                    |
| ----------- | ---------------------------- | ------------------------------ |
| `NODE_ENV`  | `development`                | `production` enables JSON output |
| `LOG_LEVEL` | `INFO` (prod) / `DEBUG` (dev) | Minimum severity to log        |

## Severity Levels

| Level      | When to Use                              |
| ---------- | ---------------------------------------- |
| `DEBUG`    | Detailed debugging information           |
| `INFO`     | General operational information          |
| `WARNING`  | Potential issues that aren't errors      |
| `ERROR`    | Errors that need attention               |
| `CRITICAL` | System failures requiring immediate action |

## GCP Cloud Logging

In production (Cloud Run), logs are automatically picked up by GCP Cloud Logging.
The structured JSON format enables:

- Filtering by severity in Logs Explorer
- Trace ID correlation across services
- Custom field querying
- Alerting on ERROR/CRITICAL logs

## Output Examples

### Development Output

```
11:39:29 DBG Debug message {"debugData":true}
11:39:29 INF Info message {"infoData":"value"}
11:39:29 WRN Warning message {"warnData":123}
11:39:29 ERR Error message {"errorContext":"test"}
Error: Test error
    at <anonymous> ...
11:39:29 INF [AuthService] User authentication attempt {"userId":"user-123"}
11:39:29 INF [API] (trace-ab) Incoming request {"method":"POST","path":"/api/users"}
```

### Production Output (JSON)

```json
{"severity":"INFO","message":"Info message","timestamp":"2026-01-25T17:39:54.572Z","data":{"infoData":"value"}}
{"severity":"ERROR","message":"Error message: Test error","timestamp":"2026-01-25T17:39:54.573Z","data":{"errorContext":"test"},"stack":"Error: Test error\n    at ..."}
{"severity":"INFO","message":"User authentication attempt","timestamp":"2026-01-25T17:39:54.573Z","module":"AuthService","data":{"userId":"user-123"}}
{"severity":"INFO","message":"Incoming request","timestamp":"2026-01-25T17:39:54.573Z","module":"API","traceId":"trace-abc-123-xyz","data":{"method":"POST","path":"/api/users"}}
```
