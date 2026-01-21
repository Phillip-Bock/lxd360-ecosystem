import { BRANDING, DEFAULT_TEMPLATE_DATA, EMAIL_URLS } from '../config';
import type { EmailTemplate } from '../types';

// ============================================================================
// TEMPLATE COMPONENTS
// ============================================================================

/**
 * Base email layout wrapper
 */
function baseLayout(content: string, data: Record<string, unknown>): string {
  const {
    companyName = DEFAULT_TEMPLATE_DATA.companyName,
    companyAddress = DEFAULT_TEMPLATE_DATA.companyAddress,
    year = DEFAULT_TEMPLATE_DATA.year,
    unsubscribeUrl = EMAIL_URLS.unsubscribe,
    privacyUrl = EMAIL_URLS.privacy,
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${companyName}</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: ${BRANDING.backgroundColor};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    /* Link styles */
    a {
      color: ${BRANDING.linkColor};
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Button styles */
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: ${BRANDING.buttonBackground};
      color: ${BRANDING.buttonTextColor} !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }

    .button:hover {
      background-color: ${BRANDING.secondaryColor};
      text-decoration: none;
    }

    /* Responsive styles */
    @media screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .content {
        padding: 20px !important;
      }
      .button {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRANDING.backgroundColor};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRANDING.backgroundColor};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px 40px; border-bottom: 1px solid ${BRANDING.borderColor};">
              <img src="${BRANDING.logoUrl}" alt="${BRANDING.logoAlt}" width="150" style="max-width: 150px; height: auto;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: ${BRANDING.backgroundColor}; border-radius: 0 0 8px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <a href="${BRANDING.socialLinks.twitter}" style="display: inline-block; margin: 0 10px;">
                      <img src="${DEFAULT_TEMPLATE_DATA.baseUrl}/images/social/twitter.png" alt="Twitter" width="24" height="24">
                    </a>
                    <a href="${BRANDING.socialLinks.linkedin}" style="display: inline-block; margin: 0 10px;">
                      <img src="${DEFAULT_TEMPLATE_DATA.baseUrl}/images/social/linkedin.png" alt="LinkedIn" width="24" height="24">
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: ${BRANDING.mutedTextColor}; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0 0 10px 0;">&copy; ${year} ${companyName}. All rights reserved.</p>
                    <p style="margin: 0 0 10px 0;">${companyAddress}</p>
                    <p style="margin: 0;">
                      <a href="${privacyUrl}" style="color: ${BRANDING.mutedTextColor};">Privacy Policy</a>
                      &nbsp;|&nbsp;
                      <a href="${unsubscribeUrl}" style="color: ${BRANDING.mutedTextColor};">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Render a button component
 */
function button(text: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
      <tr>
        <td>
          <a href="${url}" class="button" style="display: inline-block; padding: 14px 28px; background-color: ${BRANDING.buttonBackground}; color: ${BRANDING.buttonTextColor}; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Render a heading
 */
function heading(text: string, level: 1 | 2 | 3 = 1): string {
  const sizes = { 1: '24px', 2: '20px', 3: '16px' };
  const margins = { 1: '0 0 20px 0', 2: '20px 0 15px 0', 3: '15px 0 10px 0' };
  return `<h${level} style="margin: ${margins[level]}; color: ${BRANDING.textColor}; font-size: ${sizes[level]}; font-weight: 600;">${text}</h${level}>`;
}

/**
 * Render a paragraph
 */
function paragraph(text: string): string {
  return `<p style="margin: 0 0 16px 0; color: ${BRANDING.textColor}; font-size: 16px; line-height: 1.6;">${text}</p>`;
}

/**
 * Render muted/secondary text
 */
function mutedText(text: string): string {
  return `<p style="margin: 0 0 16px 0; color: ${BRANDING.mutedTextColor}; font-size: 14px; line-height: 1.6;">${text}</p>`;
}

/**
 * Render a divider
 */
function divider(): string {
  return `<hr style="margin: 30px 0; border: none; border-top: 1px solid ${BRANDING.borderColor};">`;
}

/**
 * Render an info box
 */
function infoBox(content: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      <tr>
        <td style="padding: 20px; background-color: ${BRANDING.backgroundColor}; border-radius: 6px; border-left: 4px solid ${BRANDING.primaryColor};">
          ${content}
        </td>
      </tr>
    </table>
  `;
}

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

const templates: Record<EmailTemplate, (data: Record<string, unknown>) => string> = {
  // ===== AUTH TEMPLATES =====
  welcome: (data) => {
    const { firstName, loginUrl } = data as { firstName: string; loginUrl: string };
    return baseLayout(
      `
        ${heading(`Welcome to LXD360, ${firstName}!`)}
        ${paragraph("We're thrilled to have you on board. Your account has been created successfully, and you're now ready to explore everything LXD360 has to offer.")}
        ${paragraph("Here's what you can do next:")}
        <ul style="color: ${BRANDING.textColor}; font-size: 16px; line-height: 1.8; padding-left: 20px;">
          <li>Complete your profile to get personalized recommendations</li>
          <li>Explore our learning catalog</li>
          <li>Connect with other learning professionals</li>
        </ul>
        ${button('Get Started', loginUrl)}
        ${mutedText('If you have unknown questions, our support team is here to help.')}
      `,
      data,
    );
  },

  password_reset: (data) => {
    const { firstName, resetUrl, expiresAt } = data as {
      firstName: string;
      resetUrl: string;
      expiresAt: string;
    };
    return baseLayout(
      `
        ${heading('Reset Your Password')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph('We received a request to reset your password. Click the button below to create a new password:')}
        ${button('Reset Password', resetUrl)}
        ${infoBox(mutedText(`This link will expire on ${expiresAt}. If you didn't request a password reset, you can safely ignore this email.`))}
        ${mutedText('For security reasons, this link can only be used once.')}
      `,
      data,
    );
  },

  email_verification: (data) => {
    const { firstName, verifyUrl } = data as { firstName: string; verifyUrl: string };
    return baseLayout(
      `
        ${heading('Verify Your Email Address')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph('Please verify your email address to complete your account setup and ensure you receive important updates.')}
        ${button('Verify Email', verifyUrl)}
        ${mutedText("If you didn't create an account with LXD360, you can safely ignore this email.")}
      `,
      data,
    );
  },

  // ===== GENERAL TEMPLATES =====
  contact_confirmation: (data) => {
    const { firstName, ticketId, subject, expectedResponse } = data as {
      firstName: string;
      ticketId: string;
      subject: string;
      expectedResponse: string;
    };
    return baseLayout(
      `
        ${heading("We've Received Your Message")}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph("Thank you for reaching out! We've received your message and our team will review it shortly.")}
        ${infoBox(`
          <p style="margin: 0 0 10px 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Ticket ID:</strong> ${ticketId}</p>
          <p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Subject:</strong> ${subject}</p>
        `)}
        ${paragraph(`${expectedResponse}`)}
        ${mutedText('Please keep this email for your records. You can reference the ticket ID in unknown follow-up communications.')}
      `,
      data,
    );
  },

  waitlist_welcome: (data) => {
    const { firstName, position, referralLink } = data as {
      firstName: string;
      position?: number;
      referralLink?: string;
    };
    return baseLayout(
      `
        ${heading("You're on the List!")}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph("Thanks for joining our waitlist! We're working hard to bring you something amazing, and you'll be among the first to know when we launch.")}
        ${position ? infoBox(`<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 16px; text-align: center;"><strong>Your position: #${position}</strong></p>`) : ''}
        ${
          referralLink
            ? `
          ${divider()}
          ${heading('Move Up the List', 2)}
          ${paragraph('Share your unique link with friends to move up in line:')}
          ${infoBox(`<p style="margin: 0; word-break: break-all; color: ${BRANDING.linkColor};">${referralLink}</p>`)}
        `
            : ''
        }
        ${mutedText("We'll keep you updated on our progress. Stay tuned!")}
      `,
      data,
    );
  },

  // ===== INSPIRE STUDIO TEMPLATES =====
  project_invite: (data) => {
    const { firstName, inviterName, projectName, projectDescription, role, acceptUrl, declineUrl } =
      data as {
        firstName: string;
        inviterName: string;
        projectName: string;
        projectDescription?: string;
        role: string;
        acceptUrl: string;
        declineUrl: string;
      };
    return baseLayout(
      `
        ${heading("You're Invited to Collaborate")}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`${inviterName} has invited you to join the project "${projectName}" as a ${role}.`)}
        ${projectDescription ? infoBox(paragraph(projectDescription)) : ''}
        ${button('Accept Invitation', acceptUrl)}
        ${mutedText(`If you don't want to join this project, you can <a href="${declineUrl}">decline the invitation</a>.`)}
      `,
      data,
    );
  },

  review_request: (data) => {
    const { firstName, requesterName, projectName, reviewUrl } = data as {
      firstName: string;
      requesterName: string;
      projectName: string;
      reviewUrl: string;
    };
    return baseLayout(
      `
        ${heading('Review Requested')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`${requesterName} has requested your review on the project "${projectName}".`)}
        ${paragraph('Your feedback is valuable and will help improve the content.')}
        ${button('Start Review', reviewUrl)}
      `,
      data,
    );
  },

  project_published: (data) => {
    const { firstName, projectName, projectUrl } = data as {
      firstName: string;
      projectName: string;
      projectUrl: string;
    };
    return baseLayout(
      `
        ${heading('Your Project is Live!')}
        ${paragraph(`Congratulations ${firstName}!`)}
        ${paragraph(`Your project "${projectName}" has been published and is now available to your audience.`)}
        ${button('View Project', projectUrl)}
        ${mutedText('Share your project with others to maximize its reach and impact.')}
      `,
      data,
    );
  },

  collaboration_alert: (data) => {
    const { firstName, projectName, activityType, actorName, projectUrl } = data as {
      firstName: string;
      projectName: string;
      activityType: string;
      actorName?: string;
      projectUrl: string;
    };
    return baseLayout(
      `
        ${heading('New Activity on Your Project')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`There's new activity on "${projectName}": ${actorName ? `${actorName} ` : ''}${activityType}.`)}
        ${button('View Project', projectUrl)}
      `,
      data,
    );
  },

  // ===== LMS TEMPLATES =====
  course_enrolled: (data) => {
    const { firstName, courseName, courseUrl, instructorName, startDate, description } = data as {
      firstName: string;
      courseName: string;
      courseUrl: string;
      instructorName?: string;
      startDate?: string;
      description?: string;
    };
    return baseLayout(
      `
        ${heading(`Welcome to ${courseName}!`)}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph("You've been successfully enrolled in this course. We're excited to have you on this learning journey!")}
        ${infoBox(`
          ${instructorName ? `<p style="margin: 0 0 10px 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Instructor:</strong> ${instructorName}</p>` : ''}
          ${startDate ? `<p style="margin: 0 0 10px 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Start Date:</strong> ${startDate}</p>` : ''}
          ${description ? `<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;">${description}</p>` : ''}
        `)}
        ${button('Start Learning', courseUrl)}
      `,
      data,
    );
  },

  progress_reminder: (data) => {
    const { firstName, courseName, progress, continueUrl } = data as {
      firstName: string;
      courseName: string;
      progress: number;
      continueUrl: string;
    };
    return baseLayout(
      `
        ${heading('Continue Your Learning Journey')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`You're making great progress in "${courseName}"! You're ${progress}% complete.`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
          <tr>
            <td style="background-color: ${BRANDING.borderColor}; border-radius: 4px; padding: 4px;">
              <table role="presentation" width="${progress}%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: ${BRANDING.primaryColor}; border-radius: 2px; height: 20px;"></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${paragraph("Don't lose your momentum! Continue where you left off.")}
        ${button('Continue Learning', continueUrl)}
      `,
      data,
    );
  },

  assessment_complete: (data) => {
    const {
      firstName,
      assessmentName,
      courseName,
      score,
      maxScore,
      percentage,
      passed,
      certificateUrl,
      retakeUrl,
    } = data as {
      firstName: string;
      assessmentName: string;
      courseName?: string;
      score: number;
      maxScore?: number;
      percentage?: number;
      passed: boolean;
      certificateUrl?: string;
      retakeUrl?: string;
    };
    const displayScore = maxScore ? `${score}/${maxScore}` : `${percentage || score}%`;

    return baseLayout(
      `
        ${heading('Assessment Results')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`You've completed the assessment "${assessmentName}"${courseName ? ` for ${courseName}` : ''}.`)}
        ${infoBox(`
          <p style="margin: 0; color: ${BRANDING.textColor}; font-size: 24px; text-align: center; font-weight: bold;">
            ${displayScore}
          </p>
          <p style="margin: 10px 0 0 0; color: ${passed ? '#22c55e' : '#ef4444'}; font-size: 16px; text-align: center; font-weight: 600;">
            ${passed ? 'PASSED' : 'NOT PASSED'}
          </p>
        `)}
        ${passed && certificateUrl ? button('View Certificate', certificateUrl) : ''}
        ${!passed && retakeUrl ? `${paragraph("Don't worry! You can retake this assessment.")}${button('Retake Assessment', retakeUrl)}` : ''}
      `,
      data,
    );
  },

  certificate_earned: (data) => {
    const { firstName, courseName, certificateUrl } = data as {
      firstName: string;
      courseName: string;
      certificateUrl: string;
    };
    return baseLayout(
      `
        ${heading("Congratulations! You've Earned a Certificate")}
        ${paragraph(`Way to go, ${firstName}!`)}
        ${paragraph(`You've successfully completed "${courseName}" and earned your certificate of completion.`)}
        ${paragraph('This achievement demonstrates your commitment to professional growth. Share it with your network!')}
        ${button('View Certificate', certificateUrl)}
      `,
      data,
    );
  },

  // ===== NEXUS TEMPLATES =====
  nexus_connection_request: (data) => {
    const {
      firstName,
      requesterName,
      requesterTitle,
      requesterBio,
      profileUrl,
      acceptUrl,
      declineUrl,
    } = data as {
      firstName: string;
      requesterName: string;
      requesterTitle?: string;
      requesterBio?: string;
      profileUrl: string;
      acceptUrl: string;
      declineUrl: string;
    };
    return baseLayout(
      `
        ${heading('New Connection Request')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`${requesterName} wants to connect with you on LXD Nexus.`)}
        ${infoBox(`
          <p style="margin: 0 0 5px 0; color: ${BRANDING.textColor}; font-size: 16px; font-weight: 600;">${requesterName}</p>
          ${requesterTitle ? `<p style="margin: 0 0 10px 0; color: ${BRANDING.mutedTextColor}; font-size: 14px;">${requesterTitle}</p>` : ''}
          ${requesterBio ? `<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;">${requesterBio}</p>` : ''}
        `)}
        ${button('Accept Connection', acceptUrl)}
        ${mutedText(`<a href="${profileUrl}">View full profile</a> | <a href="${declineUrl}">Decline request</a>`)}
      `,
      data,
    );
  },

  nexus_connection_accepted: (data) => {
    const { firstName, partnerName, profileUrl } = data as {
      firstName: string;
      partnerName: string;
      profileUrl: string;
    };
    return baseLayout(
      `
        ${heading('Connection Accepted!')}
        ${paragraph(`Great news, ${firstName}!`)}
        ${paragraph(`${partnerName} has accepted your connection request. You can now message each other and schedule sessions.`)}
        ${button('View Profile', profileUrl)}
      `,
      data,
    );
  },

  nexus_session_reminder: (data) => {
    const { firstName, partnerName, sessionDate, sessionTime, meetingUrl, rescheduleUrl } =
      data as {
        firstName: string;
        partnerName: string;
        sessionDate: string;
        sessionTime: string;
        meetingUrl?: string;
        rescheduleUrl: string;
      };
    return baseLayout(
      `
        ${heading('Upcoming Session Reminder')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`This is a reminder about your upcoming session with ${partnerName}.`)}
        ${infoBox(`
          <p style="margin: 0 0 10px 0; color: ${BRANDING.textColor}; font-size: 16px;"><strong>Date:</strong> ${sessionDate}</p>
          <p style="margin: 0; color: ${BRANDING.textColor}; font-size: 16px;"><strong>Time:</strong> ${sessionTime}</p>
        `)}
        ${meetingUrl ? button('Join Session', meetingUrl) : ''}
        ${mutedText(`Need to change the time? <a href="${rescheduleUrl}">Reschedule session</a>`)}
      `,
      data,
    );
  },

  nexus_new_message: (data) => {
    const { firstName, senderName, messagePreview, viewUrl } = data as {
      firstName: string;
      senderName: string;
      messagePreview: string;
      viewUrl: string;
    };
    return baseLayout(
      `
        ${heading('New Message')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`You have a new message from ${senderName}:`)}
        ${infoBox(`<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px; font-style: italic;">"${messagePreview}..."</p>`)}
        ${button('View Message', viewUrl)}
      `,
      data,
    );
  },

  // ===== CONSULTATION TEMPLATES =====
  consultation_received: (data) => {
    const { firstName, serviceName, requestId, expectedResponse } = data as {
      firstName: string;
      serviceName: string;
      requestId: string;
      expectedResponse: string;
    };
    return baseLayout(
      `
        ${heading("We've Received Your Consultation Request")}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`Thank you for your interest in our ${serviceName} service. We've received your request and our team is reviewing it.`)}
        ${infoBox(`<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Request ID:</strong> ${requestId}</p>`)}
        ${paragraph(expectedResponse)}
        ${mutedText("We'll be in touch soon with next steps.")}
      `,
      data,
    );
  },

  consultation_proposal: (data) => {
    const { firstName, serviceName, proposalUrl } = data as {
      firstName: string;
      serviceName: string;
      proposalUrl: string;
    };
    return baseLayout(
      `
        ${heading('Your Consultation Proposal is Ready')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`We've prepared a customized proposal for your ${serviceName} consultation. Please review the details and let us know if you have unknown questions.`)}
        ${button('View Proposal', proposalUrl)}
        ${mutedText('This proposal is valid for 30 days.')}
      `,
      data,
    );
  },

  consultation_scheduled: (data) => {
    const { firstName, consultantName, date, time, meetingUrl } = data as {
      firstName: string;
      consultantName: string;
      date: string;
      time: string;
      meetingUrl: string;
    };
    return baseLayout(
      `
        ${heading('Your Consultation is Scheduled')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`Your consultation with ${consultantName} has been confirmed.`)}
        ${infoBox(`
          <p style="margin: 0 0 10px 0; color: ${BRANDING.textColor}; font-size: 16px;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 0 0 10px 0; color: ${BRANDING.textColor}; font-size: 16px;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 0; color: ${BRANDING.textColor}; font-size: 16px;"><strong>Consultant:</strong> ${consultantName}</p>
        `)}
        ${button('Join Meeting', meetingUrl)}
        ${mutedText('Please join the meeting 5 minutes before the scheduled time.')}
      `,
      data,
    );
  },

  // ===== ECOMMERCE TEMPLATES =====
  order_confirmation: (data) => {
    const {
      firstName,
      orderId,
      orderDate,
      items,
      subtotal,
      tax,
      total,
      currency = 'USD',
      receiptUrl,
    } = data as {
      firstName: string;
      orderId: string;
      orderDate: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      subtotal: number;
      tax: number;
      total: number;
      currency?: string;
      receiptUrl: string;
    };
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

    return baseLayout(
      `
        ${heading(`Order Confirmation #${orderId}`)}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph("Thank you for your order! Here's a summary of your purchase:")}
        ${infoBox(`<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Order Date:</strong> ${orderDate}</p>`)}

        <table role="presentation" width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0; border-collapse: collapse;">
          <tr style="background-color: ${BRANDING.backgroundColor};">
            <th align="left" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px; border-bottom: 2px solid ${BRANDING.borderColor};">Item</th>
            <th align="center" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px; border-bottom: 2px solid ${BRANDING.borderColor};">Qty</th>
            <th align="right" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px; border-bottom: 2px solid ${BRANDING.borderColor};">Price</th>
          </tr>
          ${items
            .map(
              (item) => `
            <tr>
              <td style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px; border-bottom: 1px solid ${BRANDING.borderColor};">${item.name}</td>
              <td align="center" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px; border-bottom: 1px solid ${BRANDING.borderColor};">${item.quantity}</td>
              <td align="right" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px; border-bottom: 1px solid ${BRANDING.borderColor};">${formatter.format(item.price)}</td>
            </tr>
          `,
            )
            .join('')}
          <tr>
            <td colspan="2" align="right" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px;">Subtotal:</td>
            <td align="right" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px;">${formatter.format(subtotal)}</td>
          </tr>
          <tr>
            <td colspan="2" align="right" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px;">Tax:</td>
            <td align="right" style="color: ${BRANDING.textColor}; font-size: 14px; padding: 10px;">${formatter.format(tax)}</td>
          </tr>
          <tr style="background-color: ${BRANDING.backgroundColor};">
            <td colspan="2" align="right" style="color: ${BRANDING.textColor}; font-size: 16px; font-weight: bold; padding: 10px;">Total:</td>
            <td align="right" style="color: ${BRANDING.textColor}; font-size: 16px; font-weight: bold; padding: 10px;">${formatter.format(total)}</td>
          </tr>
        </table>

        ${button('View Receipt', receiptUrl)}
      `,
      data,
    );
  },

  invoice_receipt: (data) => {
    const {
      firstName,
      invoiceNumber,
      amount,
      currency = 'USD',
      invoiceUrl,
    } = data as {
      firstName: string;
      invoiceNumber: string;
      amount: number;
      currency?: string;
      invoiceUrl: string;
    };
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

    return baseLayout(
      `
        ${heading('Your Invoice from LXD360')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph("Here's your invoice for the recent payment:")}
        ${infoBox(`
          <p style="margin: 0 0 10px 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Invoice #:</strong> ${invoiceNumber}</p>
          <p style="margin: 0; color: ${BRANDING.textColor}; font-size: 20px; font-weight: bold;">${formatter.format(amount)}</p>
        `)}
        ${button('View Invoice', invoiceUrl)}
      `,
      data,
    );
  },

  subscription_created: (data) => {
    const { firstName, planName, nextBillingDate } = data as {
      firstName: string;
      planName: string;
      nextBillingDate: string;
    };
    return baseLayout(
      `
        ${heading('Welcome to Your Subscription!')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`Your ${planName} subscription is now active. Welcome aboard!`)}
        ${infoBox(`<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Next billing date:</strong> ${nextBillingDate}</p>`)}
        ${paragraph('You now have access to all the features included in your plan.')}
        ${button('Go to Dashboard', EMAIL_URLS.dashboard)}
      `,
      data,
    );
  },

  subscription_renewed: (data) => {
    const {
      firstName,
      planName,
      amount,
      currency = 'USD',
      nextBillingDate,
    } = data as {
      firstName: string;
      planName: string;
      amount: number;
      currency?: string;
      nextBillingDate: string;
    };
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

    return baseLayout(
      `
        ${heading('Subscription Renewed')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`Your ${planName} subscription has been successfully renewed.`)}
        ${infoBox(`
          <p style="margin: 0 0 10px 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Amount charged:</strong> ${formatter.format(amount)}</p>
          <p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Next billing date:</strong> ${nextBillingDate}</p>
        `)}
        ${mutedText('Thank you for continuing to be a valued subscriber.')}
      `,
      data,
    );
  },

  subscription_canceled: (data) => {
    const { firstName, planName, endDate } = data as {
      firstName: string;
      planName: string;
      endDate: string;
    };
    return baseLayout(
      `
        ${heading('Subscription Canceled')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`Your ${planName} subscription has been canceled as requested.`)}
        ${infoBox(`<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;">You'll continue to have access until <strong>${endDate}</strong></p>`)}
        ${paragraph("We're sorry to see you go. If you change your mind, you can resubscribe at unknown time.")}
        ${mutedText("If you have unknown feedback about why you canceled, we'd love to hear it.")}
      `,
      data,
    );
  },

  subscription_expiring: (data) => {
    const { firstName, planName, expiryDate, renewUrl } = data as {
      firstName: string;
      planName: string;
      expiryDate: string;
      renewUrl: string;
    };
    return baseLayout(
      `
        ${heading('Your Subscription is Expiring Soon')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`Your ${planName} subscription is set to expire on ${expiryDate}.`)}
        ${paragraph('Renew now to keep uninterrupted access to all your features and content.')}
        ${button('Renew Subscription', renewUrl)}
        ${mutedText("If you've already renewed or have questions, please contact our support team.")}
      `,
      data,
    );
  },

  payment_failed: (data) => {
    const {
      firstName,
      amount,
      currency = 'USD',
      reason,
      subscriptionName,
      updatePaymentUrl,
      retryDate,
    } = data as {
      firstName: string;
      amount: number;
      currency?: string;
      reason: string;
      subscriptionName?: string;
      updatePaymentUrl: string;
      retryDate?: string;
    };
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

    return baseLayout(
      `
        ${heading('Payment Failed - Action Required')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`We were unable to process your payment of ${formatter.format(amount)}${subscriptionName ? ` for ${subscriptionName}` : ''}.`)}
        ${infoBox(`<p style="margin: 0; color: ${BRANDING.textColor}; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>`)}
        ${paragraph('Please update your payment method to avoid unknown interruption to your service.')}
        ${button('Update Payment Method', updatePaymentUrl)}
        ${retryDate ? mutedText(`We'll automatically retry the payment on ${retryDate}.`) : ''}
      `,
      data,
    );
  },

  payment_method_updated: (data) => {
    const { firstName, last4 } = data as {
      firstName: string;
      last4: string;
    };
    return baseLayout(
      `
        ${heading('Payment Method Updated')}
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph(`Your payment method has been successfully updated to a card ending in ${last4}.`)}
        ${paragraph('All future payments will be charged to this card.')}
        ${mutedText("If you didn't make this change, please contact our support team immediately.")}
      `,
      data,
    );
  },
};

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================

/**
 * Render an email template with data
 */
export function renderTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
  const renderFn = templates[template];

  if (!renderFn) {
    throw new Error(`Unknown email template: ${template}`);
  }

  return renderFn(data);
}

/**
 * Get list of all available templates
 */
export function getAvailableTemplates(): EmailTemplate[] {
  return Object.keys(templates) as EmailTemplate[];
}

/**
 * Check if a template exists
 */
export function templateExists(template: string): template is EmailTemplate {
  return template in templates;
}

// ============================================================================
// EXPORTS
// ============================================================================

const emailTemplateRenderer = {
  render: renderTemplate,
  getAvailable: getAvailableTemplates,
  exists: templateExists,
};

export default emailTemplateRenderer;
