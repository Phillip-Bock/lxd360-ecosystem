import fs from 'node:fs';
import path from 'node:path';
import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig): Promise<void> {
  process.stdout.write('🚀 Running global setup...\n');

  // Create .auth directory if it doesn't exist
  const authDir = path.join(process.cwd(), 'tests', '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Get the base URL from config
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';

  // Wait for the server to be ready
  const maxRetries = 30;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(`${baseURL}/api/health`);
      if (response.ok) {
        process.stdout.write('✅ Server is ready\n');
        break;
      }
    } catch {
      retries++;
      if (retries === maxRetries) {
        process.stdout.write('⚠️ Server health check failed, continuing anyway...\n');
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Set up test user authentication state
  // This creates a storage state file that can be reused across tests
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/auth/login`, { waitUntil: 'networkidle' });

    // Check if we have test credentials
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

    // Fill in login form
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation or dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {
      process.stdout.write('⚠️ Could not authenticate test user - tests will run unauthenticated\n');
    });

    // Save the storage state
    await context.storageState({
      path: path.join(authDir, 'user.json'),
    });

    process.stdout.write('✅ Test user authenticated and storage state saved\n');
  } catch (error) {
    process.stdout.write(`⚠️ Authentication setup failed: ${error}\n`);

    // Create an empty storage state file so tests can still run
    fs.writeFileSync(path.join(authDir, 'user.json'), JSON.stringify({ cookies: [], origins: [] }));
  }

  await browser.close();

  process.stdout.write('✅ Global setup complete\n');
}

export default globalSetup;
