import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Running global teardown...');

  // Clean up authentication state files if in CI
  if (process.env.CI) {
    const authDir = path.join(process.cwd(), 'tests', '.auth');
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
      console.log('✅ Cleaned up auth state files');
    }
  }

  // Any additional cleanup can go here
  // For example:
  // - Clean up test data created during tests
  // - Close database connections
  // - Clear caches

  console.log('✅ Global teardown complete');
}

export default globalTeardown;
