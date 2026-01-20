import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

// Reset any request handlers that are declared in tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => {
  server.close();
});
