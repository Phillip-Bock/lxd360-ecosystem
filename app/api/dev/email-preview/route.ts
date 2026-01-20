export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import {
  getAvailableTemplates,
  renderTemplate,
  templateExists,
} from '@/lib/email/templates/renderer';
import type { EmailTemplate } from '@/lib/email/types';
import { TEMPLATE_REGISTRY } from '@/lib/email/types';

// ============================================================================
// SAMPLE DATA FOR PREVIEWS
// ============================================================================

const SAMPLE_DATA: Record<string, Record<string, unknown>> = {
  welcome: {
    firstName: 'John',
    email: 'john@example.com',
    loginUrl: 'https://lxd360.com/login',
  },
  password_reset: {
    firstName: 'John',
    resetUrl: 'https://lxd360.com/reset?token=abc123',
    expiresAt: 'December 4, 2024 at 3:00 PM',
  },
  email_verification: {
    firstName: 'John',
    verifyUrl: 'https://lxd360.com/verify?token=abc123',
  },
  contact_confirmation: {
    firstName: 'John',
    ticketId: 'CONTACT-2024-ABC123',
    subject: 'Product inquiry',
    expectedResponse: 'We typically respond within 24-48 hours.',
  },
  waitlist_welcome: {
    firstName: 'John',
    position: 42,
    referralLink: 'https://lxd360.com/waitlist?ref=abc123',
  },
  project_invite: {
    firstName: 'John',
    inviterName: 'Jane Smith',
    projectName: 'eLearning Course Development',
    projectDescription: 'Building an interactive compliance training module.',
    role: 'Content Reviewer',
    acceptUrl: 'https://lxd360.com/invites/accept/123',
    declineUrl: 'https://lxd360.com/invites/decline/123',
  },
  review_request: {
    firstName: 'John',
    requesterName: 'Jane Smith',
    projectName: 'eLearning Course Development',
    reviewUrl: 'https://lxd360.com/projects/123/review',
  },
  project_published: {
    firstName: 'John',
    projectName: 'eLearning Course Development',
    projectUrl: 'https://lxd360.com/projects/123',
  },
  collaboration_alert: {
    firstName: 'John',
    projectName: 'eLearning Course Development',
    activityType: 'added new content',
    actorName: 'Jane Smith',
    projectUrl: 'https://lxd360.com/projects/123',
  },
  course_enrolled: {
    firstName: 'John',
    courseName: 'Advanced Instructional Design',
    courseUrl: 'https://lxd360.com/courses/123',
    instructorName: 'Dr. Sarah Johnson',
    startDate: 'January 15, 2025',
    description: 'Master the art of creating engaging learning experiences.',
  },
  progress_reminder: {
    firstName: 'John',
    courseName: 'Advanced Instructional Design',
    progress: 65,
    continueUrl: 'https://lxd360.com/courses/123/continue',
  },
  assessment_complete: {
    firstName: 'John',
    assessmentName: 'Module 3 Assessment',
    courseName: 'Advanced Instructional Design',
    score: 42,
    maxScore: 50,
    percentage: 84,
    passed: true,
    certificateUrl: 'https://lxd360.com/certificates/123',
  },
  certificate_earned: {
    firstName: 'John',
    courseName: 'Advanced Instructional Design',
    certificateUrl: 'https://lxd360.com/certificates/123',
  },
  nexus_connection_request: {
    firstName: 'John',
    requesterName: 'Jane Smith',
    requesterTitle: 'Senior Instructional Designer',
    requesterBio: '10+ years of experience in corporate L&D with a focus on interactive eLearning.',
    profileUrl: 'https://lxd360.com/nexus/profiles/jane',
    acceptUrl: 'https://lxd360.com/nexus/connections/accept/123',
    declineUrl: 'https://lxd360.com/nexus/connections/decline/123',
  },
  nexus_connection_accepted: {
    firstName: 'John',
    partnerName: 'Jane Smith',
    profileUrl: 'https://lxd360.com/nexus/profiles/jane',
  },
  nexus_session_reminder: {
    firstName: 'John',
    partnerName: 'Jane Smith',
    sessionDate: 'December 10, 2024',
    sessionTime: '2:00 PM EST',
    meetingUrl: 'https://lxd360.com/meet/abc123',
    rescheduleUrl: 'https://lxd360.com/nexus/sessions/123/reschedule',
  },
  nexus_new_message: {
    firstName: 'John',
    senderName: 'Jane Smith',
    messagePreview:
      'Hi John, I wanted to follow up on our conversation about the accessibility standards',
    viewUrl: 'https://lxd360.com/nexus/messages/123',
  },
  consultation_received: {
    firstName: 'John',
    serviceName: 'Custom eLearning Development',
    requestId: 'CONSULT-2024-123',
    expectedResponse: 'Our team will review your request and respond within 2 business days.',
  },
  consultation_proposal: {
    firstName: 'John',
    serviceName: 'Custom eLearning Development',
    proposalUrl: 'https://lxd360.com/consultations/proposals/123',
  },
  consultation_scheduled: {
    firstName: 'John',
    consultantName: 'Dr. Sarah Johnson',
    date: 'December 15, 2024',
    time: '10:00 AM EST',
    meetingUrl: 'https://lxd360.com/meet/consult123',
  },
  order_confirmation: {
    firstName: 'John',
    orderId: 'ORD-2024-12345',
    orderDate: 'December 3, 2024',
    items: [
      { name: 'INSPIRE Studio Pro', quantity: 1, price: 299 },
      { name: 'LXP360 Enterprise License', quantity: 5, price: 495 },
    ],
    subtotal: 794,
    tax: 63.52,
    total: 857.52,
    currency: 'USD',
    receiptUrl: 'https://lxd360.com/orders/12345/receipt',
  },
  invoice_receipt: {
    firstName: 'John',
    invoiceNumber: 'INV-2024-001',
    amount: 857.52,
    currency: 'USD',
    invoiceUrl: 'https://lxd360.com/invoices/001',
  },
  subscription_created: {
    firstName: 'John',
    planName: 'INSPIRE Studio Pro',
    nextBillingDate: 'January 3, 2025',
  },
  subscription_renewed: {
    firstName: 'John',
    planName: 'INSPIRE Studio Pro',
    amount: 29.99,
    currency: 'USD',
    nextBillingDate: 'February 3, 2025',
  },
  subscription_canceled: {
    firstName: 'John',
    planName: 'INSPIRE Studio Pro',
    endDate: 'February 3, 2025',
  },
  subscription_expiring: {
    firstName: 'John',
    planName: 'INSPIRE Studio Pro',
    expiryDate: 'February 3, 2025',
    renewUrl: 'https://lxd360.com/billing/renew',
  },
  payment_failed: {
    firstName: 'John',
    amount: 29.99,
    currency: 'USD',
    reason: 'Card declined - insufficient funds',
    subscriptionName: 'INSPIRE Studio Pro',
    updatePaymentUrl: 'https://lxd360.com/billing/payment-method',
    retryDate: 'December 6, 2024',
  },
  payment_method_updated: {
    firstName: 'John',
    last4: '4242',
  },
};

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * GET /api/dev/email-preview
 *
 * List available templates or preview a specific template
 *
 * Query params:
 * - template: Template name to preview
 * - format: "html" (default) or "json"
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Email preview is only available in development' },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const templateName = searchParams.get('template');
  const format = searchParams.get('format') || 'html';

  // If no template specified, return list of available templates
  if (!templateName) {
    const templates = getAvailableTemplates().map((templateId) => ({
      ...TEMPLATE_REGISTRY[templateId],
      previewUrl: `/api/dev/email-preview?template=${templateId}`,
      hasSampleData: templateId in SAMPLE_DATA,
    }));

    return NextResponse.json({
      templates,
      total: templates.length,
      usage: 'Add ?template=<template_id> to preview a specific template',
    });
  }

  // Validate template exists
  if (!templateExists(templateName)) {
    return NextResponse.json(
      {
        error: `Unknown template: ${templateName}`,
        availableTemplates: getAvailableTemplates(),
      },
      { status: 404 },
    );
  }

  // Get sample data for template
  const sampleData = SAMPLE_DATA[templateName] || {
    firstName: 'Test User',
  };

  try {
    // Render the template
    const html = renderTemplate(templateName as EmailTemplate, sampleData);
    const metadata = TEMPLATE_REGISTRY[templateName as EmailTemplate];

    if (format === 'json') {
      return NextResponse.json({
        template: templateName,
        metadata,
        sampleData,
        html,
      });
    }

    // Return HTML directly for browser preview
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to render template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/dev/email-preview
 *
 * Preview a template with custom data
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Email preview is only available in development' },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { template, data } = body;

    if (!template) {
      return NextResponse.json({ error: 'Template is required' }, { status: 400 });
    }

    if (!templateExists(template)) {
      return NextResponse.json(
        {
          error: `Unknown template: ${template}`,
          availableTemplates: getAvailableTemplates(),
        },
        { status: 404 },
      );
    }

    // Merge provided data with sample data
    const mergedData = {
      ...(SAMPLE_DATA[template] || {}),
      ...(data || {}),
    };

    const html = renderTemplate(template as EmailTemplate, mergedData);
    const metadata = TEMPLATE_REGISTRY[template as EmailTemplate];

    return NextResponse.json({
      template,
      metadata,
      data: mergedData,
      html,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to render template',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
