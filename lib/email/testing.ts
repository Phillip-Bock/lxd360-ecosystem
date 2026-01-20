import { getAvailableTemplates, renderTemplate } from './templates/renderer';
import type { EmailPayload, EmailResult, EmailTemplate } from './types';
import { TEMPLATE_REGISTRY } from './types';

// ============================================================================
// MOCK EMAIL CLIENT
// ============================================================================

/**
 * In-memory sent emails for testing
 */
const sentEmails: EmailPayload[] = [];

/**
 * Mock email result generator
 */
let mockResultGenerator: ((payload: EmailPayload) => EmailResult) | null = null;

/**
 * Clear all sent emails
 */
export function clearSentEmails(): void {
  sentEmails.length = 0;
}

/**
 * Get all sent emails
 */
export function getSentEmails(): EmailPayload[] {
  return [...sentEmails];
}

/**
 * Get emails sent to a specific address
 */
export function getEmailsTo(email: string): EmailPayload[] {
  return sentEmails.filter((e) => {
    const recipients = Array.isArray(e.to) ? e.to : [e.to];
    return recipients.includes(email);
  });
}

/**
 * Get emails with a specific template
 */
export function getEmailsByTemplate(template: EmailTemplate): EmailPayload[] {
  return sentEmails.filter((e) => e.template === template);
}

/**
 * Set custom mock result generator
 */
export function setMockResultGenerator(
  generator: ((payload: EmailPayload) => EmailResult) | null,
): void {
  mockResultGenerator = generator;
}

/**
 * Mock send email function for testing
 */
export async function mockSendEmail(payload: EmailPayload): Promise<EmailResult> {
  // Store the email
  sentEmails.push({ ...payload });

  // Use custom generator if set
  if (mockResultGenerator) {
    return mockResultGenerator(payload);
  }

  // Default success result
  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

// ============================================================================
// TEMPLATE TESTING
// ============================================================================

/**
 * Validate template data has all required fields
 */
export function validateTemplateData(
  template: EmailTemplate,
  data: Record<string, unknown>,
): { valid: boolean; missing: string[] } {
  const metadata = TEMPLATE_REGISTRY[template];

  if (!metadata) {
    return { valid: false, missing: ['Template not found'] };
  }

  const missing: string[] = [];

  for (const field of metadata.requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      missing.push(field);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Test render all templates with sample data
 */
export function testRenderAllTemplates(): {
  results: Array<{
    template: EmailTemplate;
    success: boolean;
    error?: string;
    html?: string;
  }>;
  passed: number;
  failed: number;
} {
  const templates = getAvailableTemplates();
  const results: Array<{
    template: EmailTemplate;
    success: boolean;
    error?: string;
    html?: string;
  }> = [];

  let passed = 0;
  let failed = 0;

  for (const template of templates) {
    const metadata = TEMPLATE_REGISTRY[template];
    const sampleData: Record<string, unknown> = {
      firstName: 'Test User',
    };

    // Add sample values for required fields
    for (const field of metadata.requiredFields) {
      if (!(field in sampleData)) {
        sampleData[field] = `Sample ${field}`;
      }
    }

    try {
      const html = renderTemplate(template, sampleData);
      results.push({ template, success: true, html });
      passed++;
    } catch (error) {
      results.push({
        template,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      failed++;
    }
  }

  return { results, passed, failed };
}

/**
 * Test a specific template with custom data
 */
export function testTemplate(
  template: EmailTemplate,
  data: Record<string, unknown>,
): {
  success: boolean;
  html?: string;
  validationErrors?: string[];
  renderError?: string;
} {
  // Validate data
  const validation = validateTemplateData(template, data);

  if (!validation.valid) {
    return {
      success: false,
      validationErrors: validation.missing.map((f) => `Missing required field: ${f}`),
    };
  }

  // Try to render
  try {
    const html = renderTemplate(template, data);
    return { success: true, html };
  } catch (error) {
    return {
      success: false,
      renderError: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// EMAIL ASSERTIONS (for unit tests)
// ============================================================================

/**
 * Assert an email was sent
 */
export function assertEmailSent(options?: {
  to?: string;
  template?: EmailTemplate;
  subject?: string;
}): void {
  let emails = sentEmails;

  if (options?.to) {
    const toAddress = options.to;
    emails = emails.filter((e) => {
      const recipients = Array.isArray(e.to) ? e.to : [e.to];
      return recipients.includes(toAddress);
    });
  }

  if (options?.template) {
    emails = emails.filter((e) => e.template === options.template);
  }

  if (options?.subject) {
    emails = emails.filter((e) => e.subject === options.subject);
  }

  if (emails.length === 0) {
    throw new Error(
      `Expected email to be sent${options ? ` with ${JSON.stringify(options)}` : ''}, but no matching email was found`,
    );
  }
}

/**
 * Assert no emails were sent
 */
export function assertNoEmailsSent(): void {
  if (sentEmails.length > 0) {
    throw new Error(`Expected no emails to be sent, but ${sentEmails.length} email(s) were sent`);
  }
}

/**
 * Assert a specific number of emails were sent
 */
export function assertEmailCount(
  count: number,
  options?: {
    to?: string;
    template?: EmailTemplate;
  },
): void {
  let emails = sentEmails;

  if (options?.to) {
    const toAddress = options.to;
    emails = emails.filter((e) => {
      const recipients = Array.isArray(e.to) ? e.to : [e.to];
      return recipients.includes(toAddress);
    });
  }

  if (options?.template) {
    emails = emails.filter((e) => e.template === options.template);
  }

  if (emails.length !== count) {
    throw new Error(
      `Expected ${count} email(s) to be sent${options ? ` with ${JSON.stringify(options)}` : ''}, but ${emails.length} were sent`,
    );
  }
}

/**
 * Assert email contains specific data
 */
export function assertEmailContains(
  emailIndex: number,
  assertions: {
    to?: string | string[];
    template?: EmailTemplate;
    subject?: string;
    data?: Record<string, unknown>;
  },
): void {
  const email = sentEmails[emailIndex];

  if (!email) {
    throw new Error(`No email at index ${emailIndex}`);
  }

  if (assertions.to) {
    const expectedTo = Array.isArray(assertions.to) ? assertions.to : [assertions.to];
    const actualTo = Array.isArray(email.to) ? email.to : [email.to];

    for (const addr of expectedTo) {
      if (!actualTo.includes(addr)) {
        throw new Error(
          `Expected email to be sent to ${addr}, but was sent to ${actualTo.join(', ')}`,
        );
      }
    }
  }

  if (assertions.template && email.template !== assertions.template) {
    throw new Error(`Expected template ${assertions.template}, but got ${email.template}`);
  }

  if (assertions.subject && email.subject !== assertions.subject) {
    throw new Error(`Expected subject "${assertions.subject}", but got "${email.subject}"`);
  }

  if (assertions.data) {
    for (const [key, value] of Object.entries(assertions.data)) {
      if (email.data[key] !== value) {
        throw new Error(
          `Expected data.${key} to be ${JSON.stringify(value)}, but got ${JSON.stringify(email.data[key])}`,
        );
      }
    }
  }
}

// ============================================================================
// SAMPLE DATA GENERATORS
// ============================================================================

/**
 * Generate sample data for unknown template
 */
export function generateSampleData(template: EmailTemplate): Record<string, unknown> {
  const baseData: Record<string, unknown> = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    year: new Date().getFullYear(),
  };

  const templateSpecificData: Partial<Record<EmailTemplate, Record<string, unknown>>> = {
    welcome: {
      loginUrl: 'https://example.com/login',
    },
    password_reset: {
      resetUrl: 'https://example.com/reset?token=abc123',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
    },
    email_verification: {
      verifyUrl: 'https://example.com/verify?token=abc123',
    },
    contact_confirmation: {
      ticketId: 'TICKET-12345',
      subject: 'Product Inquiry',
      expectedResponse: 'We will respond within 24-48 hours.',
    },
    order_confirmation: {
      orderId: 'ORD-12345',
      orderDate: new Date().toLocaleDateString(),
      items: [
        { name: 'Product A', quantity: 2, price: 29.99 },
        { name: 'Product B', quantity: 1, price: 49.99 },
      ],
      subtotal: 109.97,
      tax: 8.8,
      total: 118.77,
      receiptUrl: 'https://example.com/receipts/12345',
    },
    course_enrolled: {
      courseName: 'Introduction to Learning Design',
      courseUrl: 'https://example.com/courses/intro-ld',
      instructorName: 'Dr. Jane Smith',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
    assessment_complete: {
      assessmentName: 'Module 1 Quiz',
      courseName: 'Introduction to Learning Design',
      score: 85,
      maxScore: 100,
      percentage: 85,
      passed: true,
      certificateUrl: 'https://example.com/certificates/12345',
    },
    nexus_connection_request: {
      requesterName: 'Jane Smith',
      requesterTitle: 'Senior Learning Designer',
      requesterBio: 'Passionate about creating engaging learning experiences.',
      profileUrl: 'https://example.com/profiles/jane-smith',
      acceptUrl: 'https://example.com/connections/accept/123',
      declineUrl: 'https://example.com/connections/decline/123',
    },
  };

  return {
    ...baseData,
    ...(templateSpecificData[template] || {}),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const emailTestUtils = {
  // Mock client
  mockSendEmail,
  clearSentEmails,
  getSentEmails,
  getEmailsTo,
  getEmailsByTemplate,
  setMockResultGenerator,

  // Template testing
  validateTemplateData,
  testRenderAllTemplates,
  testTemplate,

  // Assertions
  assertEmailSent,
  assertNoEmailsSent,
  assertEmailCount,
  assertEmailContains,

  // Sample data
  generateSampleData,
};

export default emailTestUtils;
