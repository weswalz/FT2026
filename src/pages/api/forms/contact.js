// POST /api/forms/contact
import { createSubmission } from '../../../lib/forms.js';
import { checkRateLimit, getClientIp, sanitizeString, isValidEmail, logAudit } from '../../../lib/security.js';

export async function POST({ request }) {
  try {
    const clientIp = getClientIp(request);

    // Rate limiting: 10 submissions per hour per IP
    const rateLimit = checkRateLimit(clientIp, 'contact-form', 10, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil((rateLimit.resetAt - new Date()) / 60000);

      logAudit({
        action: 'RATE_LIMIT_EXCEEDED',
        entity: 'contact-form',
        ipAddress: clientIp,
        details: { endpoint: 'contact-form', resetMinutes }
      });

      return new Response(JSON.stringify({
        success: false,
        error: `Too many submissions. Please try again in ${resetMinutes} minutes.`,
        resetAt: rateLimit.resetAt
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetAt.toISOString()
        }
      });
    }

    const data = await request.json();

    // Sanitize input
    const name = sanitizeString(data.name, 100);
    const email = sanitizeString(data.email, 200);
    const phone = data.phone ? sanitizeString(data.phone, 20) : null;
    const subject = sanitizeString(data.subject || 'General Inquiry', 200);
    const message = sanitizeString(data.message, 5000);

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, and message are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create submission
    const submission = createSubmission({
      formType: 'contact',
      name,
      email,
      payload: {
        name,
        email,
        phone,
        subject,
        message
      },
      status: 'new'
    });

    if (!submission) {
      logAudit({
        action: 'FORM_SUBMISSION_FAILED',
        entity: 'contact-form',
        ipAddress: clientIp,
        details: { error: 'Database error' }
      });

      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to save submission'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log successful submission
    logAudit({
      action: 'FORM_SUBMITTED',
      entity: 'contact-form',
      entityId: submission.id,
      ipAddress: clientIp,
      details: { name, email, subject }
    });

    // TODO: Send email notification (optional)
    // await sendEmailNotification(submission);

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you soon.',
      submissionId: submission.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString()
      }
    });

  } catch (error) {
    console.error('[API] Contact form error:', error);

    logAudit({
      action: 'FORM_SUBMISSION_ERROR',
      entity: 'contact-form',
      ipAddress: getClientIp(request),
      details: { error: error.message }
    });

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
