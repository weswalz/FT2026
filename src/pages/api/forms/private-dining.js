// POST /api/forms/private-dining
import { createSubmission } from '../../../lib/forms.js';
import { sendToN8nWebhook } from '../../../lib/webhook.js';
import { checkRateLimit, getClientIp, sanitizeString, isValidEmail, logAudit } from '../../../lib/security.js';

export async function POST({ request }) {
  try {
    const clientIp = getClientIp(request);

    // Rate limiting: 5 submissions per hour per IP (stricter for private events)
    const rateLimit = checkRateLimit(clientIp, 'private-dining-form', 5, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil((rateLimit.resetAt - new Date()) / 60000);

      logAudit({
        action: 'RATE_LIMIT_EXCEEDED',
        entity: 'private-dining-form',
        ipAddress: clientIp,
        details: { endpoint: 'private-dining-form', resetMinutes }
      });

      return new Response(JSON.stringify({
        success: false,
        error: `Too many submissions. Please try again in ${resetMinutes} minutes.`,
        resetAt: rateLimit.resetAt
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '5',
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
    const company = data.company ? sanitizeString(data.company, 200) : null;
    const eventDate = sanitizeString(data.eventDate, 50);
    const alternativeDate = data.alternativeDate ? sanitizeString(data.alternativeDate, 50) : null;
    const guestCount = parseInt(data.guestCount) || 0;
    const budget = data.budget ? sanitizeString(data.budget, 50) : null;
    const eventType = sanitizeString(data.eventType || 'Private Dining', 100);
    const dietaryRestrictions = data.dietaryRestrictions ? sanitizeString(data.dietaryRestrictions, 1000) : null;
    const specialRequests = data.specialRequests ? sanitizeString(data.specialRequests, 2000) : null;
    const message = data.message ? sanitizeString(data.message, 2000) : null;

    // Validate required fields
    if (!name || !email || !eventDate || !guestCount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, event date, and guest count are required'
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

    // Validate guest count
    if (guestCount < 1 || guestCount > 1000) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Guest count must be between 1 and 1000'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create submission
    const submission = createSubmission({
      formType: 'private_dining',
      name,
      email,
      payload: {
        name,
        email,
        phone,
        company,
        eventDate,
        alternativeDate,
        guestCount,
        budget,
        eventType,
        dietaryRestrictions,
        specialRequests,
        message
      },
      status: 'new',
      webhookStatus: 'pending'
    });

    if (!submission) {
      logAudit({
        action: 'FORM_SUBMISSION_FAILED',
        entity: 'private-dining-form',
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
      entity: 'private-dining-form',
      entityId: submission.id,
      ipAddress: clientIp,
      details: { name, email, eventDate, guestCount, eventType }
    });

    // Send to n8n webhook asynchronously (don't wait for response)
    sendToN8nWebhook(submission.id, submission.payload).catch(error => {
      console.error('[API] Webhook error:', error);
      logAudit({
        action: 'WEBHOOK_FAILED',
        entity: 'private-dining-form',
        entityId: submission.id,
        ipAddress: clientIp,
        details: { error: error.message }
      });
    });

    // Send email notification (async, don't block response)
    import('../../../lib/email.js').then(({ sendPrivateDiningNotification }) => {
      sendPrivateDiningNotification(submission).catch(error => {
        console.error('[PRIVATE_DINING] Email notification failed:', error);
        logAudit({
          action: 'EMAIL_FAILED',
          entity: 'private-dining-form',
          entityId: submission.id,
          details: { error: error.message }
        });
      });
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your private dining inquiry! Our events team will contact you within 24 hours.',
      submissionId: submission.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimit.remaining.toString()
      }
    });

  } catch (error) {
    console.error('[API] Private dining form error:', error);

    logAudit({
      action: 'FORM_SUBMISSION_ERROR',
      entity: 'private-dining-form',
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
