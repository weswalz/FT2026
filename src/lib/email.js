/**
 * Email Notification Service
 *
 * Sends email notifications for form submissions using nodemailer
 */

import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true for 465, false for other ports
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@fieldandtides.com';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'admin@fieldandtides.com';

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[EMAIL] SMTP configuration not found. Email notifications disabled.');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
}

/**
 * Send contact form notification email
 * @param {Object} submission - Form submission data
 * @returns {Promise<boolean>} - Success status
 */
export async function sendContactFormNotification(submission) {
  const transport = getTransporter();

  if (!transport) {
    console.warn('[EMAIL] Skipping contact form notification - SMTP not configured');
    return false;
  }

  try {
    const payload = JSON.parse(submission.payload);

    const mailOptions = {
      from: SMTP_FROM,
      to: NOTIFICATION_EMAIL,
      subject: `New Contact Form Submission: ${payload.subject || 'No Subject'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #114C87; border-bottom: 2px solid #F4E297; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="margin: 20px 0;">
            <p><strong>Submission ID:</strong> ${submission.id}</p>
            <p><strong>Date:</strong> ${new Date(submission.createdAt).toLocaleString()}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #114C87;">Contact Details</h3>
            <p><strong>Name:</strong> ${payload.name || 'Not provided'}</p>
            <p><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
            <p><strong>Phone:</strong> ${payload.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${payload.subject || 'Not provided'}</p>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-left: 3px solid #114C87; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #114C87;">Message</h3>
            <p style="white-space: pre-wrap;">${payload.message || 'No message provided'}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>You can view and manage this submission in the admin panel at <a href="${process.env.SITE_URL || 'http://localhost:4321'}/admin/forms/${submission.id}">/admin/forms</a></p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Submission ID: ${submission.id}
Date: ${new Date(submission.createdAt).toLocaleString()}

Contact Details:
Name: ${payload.name || 'Not provided'}
Email: ${payload.email}
Phone: ${payload.phone || 'Not provided'}
Subject: ${payload.subject || 'Not provided'}

Message:
${payload.message || 'No message provided'}

View in admin panel: ${process.env.SITE_URL || 'http://localhost:4321'}/admin/forms/${submission.id}
      `.trim()
    };

    await transport.sendMail(mailOptions);
    console.log(`[EMAIL] Contact form notification sent for submission ${submission.id}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Error sending contact form notification:', error);
    return false;
  }
}

/**
 * Send private dining inquiry notification email
 * @param {Object} submission - Form submission data
 * @returns {Promise<boolean>} - Success status
 */
export async function sendPrivateDiningNotification(submission) {
  const transport = getTransporter();

  if (!transport) {
    console.warn('[EMAIL] Skipping private dining notification - SMTP not configured');
    return false;
  }

  try {
    const payload = JSON.parse(submission.payload);

    const mailOptions = {
      from: SMTP_FROM,
      to: NOTIFICATION_EMAIL,
      subject: `New Private Dining Inquiry - ${payload.eventType || 'Event'} for ${payload.guestCount || 'N/A'} guests`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #114C87; border-bottom: 2px solid #F4E297; padding-bottom: 10px;">
            🍽️ New Private Dining Inquiry
          </h2>

          <div style="margin: 20px 0;">
            <p><strong>Submission ID:</strong> ${submission.id}</p>
            <p><strong>Date:</strong> ${new Date(submission.createdAt).toLocaleString()}</p>
            ${submission.webhookStatus === 'sent' ? '<p style="color: green;">✓ Webhook successfully sent to n8n</p>' : ''}
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #114C87;">Contact Information</h3>
            <p><strong>Name:</strong> ${payload.name || 'Not provided'}</p>
            <p><strong>Email:</strong> <a href="mailto:${payload.email}">${payload.email}</a></p>
            <p><strong>Phone:</strong> ${payload.phone || 'Not provided'}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #114C87;">Event Details</h3>
            <p><strong>Event Type:</strong> ${payload.eventType || 'Not specified'}</p>
            <p><strong>Preferred Date:</strong> ${payload.preferredDate || 'Not specified'}</p>
            <p><strong>Guest Count:</strong> ${payload.guestCount || 'Not specified'}</p>
            <p><strong>Budget per Person:</strong> ${payload.budget || 'Not specified'}</p>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-left: 3px solid #114C87; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #114C87;">Special Requests & Dietary Restrictions</h3>
            <p style="white-space: pre-wrap;">${payload.specialRequests || 'None provided'}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p><strong>⏰ Action Required:</strong> Respond within 24 hours</p>
            <p>You can view and manage this inquiry in the admin panel at <a href="${process.env.SITE_URL || 'http://localhost:4321'}/admin/forms/${submission.id}">/admin/forms</a></p>
          </div>
        </div>
      `,
      text: `
New Private Dining Inquiry

Submission ID: ${submission.id}
Date: ${new Date(submission.createdAt).toLocaleString()}
${submission.webhookStatus === 'sent' ? 'Webhook: Successfully sent to n8n\n' : ''}

Contact Information:
Name: ${payload.name || 'Not provided'}
Email: ${payload.email}
Phone: ${payload.phone || 'Not provided'}

Event Details:
Event Type: ${payload.eventType || 'Not specified'}
Preferred Date: ${payload.preferredDate || 'Not specified'}
Guest Count: ${payload.guestCount || 'Not specified'}
Budget per Person: ${payload.budget || 'Not specified'}

Special Requests & Dietary Restrictions:
${payload.specialRequests || 'None provided'}

Action Required: Respond within 24 hours
View in admin panel: ${process.env.SITE_URL || 'http://localhost:4321'}/admin/forms/${submission.id}
      `.trim()
    };

    await transport.sendMail(mailOptions);
    console.log(`[EMAIL] Private dining notification sent for submission ${submission.id}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Error sending private dining notification:', error);
    return false;
  }
}

/**
 * Verify SMTP connection
 * @returns {Promise<boolean>} - Connection status
 */
export async function verifyEmailConnection() {
  const transport = getTransporter();

  if (!transport) {
    return false;
  }

  try {
    await transport.verify();
    console.log('[EMAIL] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[EMAIL] SMTP connection verification failed:', error);
    return false;
  }
}
