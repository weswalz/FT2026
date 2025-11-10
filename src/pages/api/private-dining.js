import { createSubmission } from '../../lib/forms.js';
import { sendPrivateDiningNotification, sendCustomerConfirmation } from '../../lib/email.js';
import { sendWebhook } from '../../lib/webhooks.js';
import { validateEmail, validatePhone, getClientIP } from '../../lib/security.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.event_date || !data.guest_count || !data.message) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email format
    if (!validateEmail(data.email)) {
      return new Response(JSON.stringify({
        error: 'Invalid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate phone
    if (!validatePhone(data.phone)) {
      return new Response(JSON.stringify({
        error: 'Invalid phone number'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate guest count
    const guestCount = parseInt(data.guest_count);
    if (isNaN(guestCount) || guestCount < 1) {
      return new Response(JSON.stringify({
        error: 'Invalid guest count'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create submission record
    const submissionId = createSubmission('private_dining', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      event_date: data.event_date,
      guest_count: guestCount,
      event_type: data.event_type || null,
      special_requests: data.message,
      ip_address: getClientIP(request),
      submitted_at: new Date().toISOString()
    });

    // Send notification email (non-blocking)
    sendPrivateDiningNotification(data).catch(err =>
      console.error('Failed to send notification email:', err)
    );

    // Send confirmation to customer (non-blocking)
    sendCustomerConfirmation(data.email, data.name, 'private-dining').catch(err =>
      console.error('Failed to send confirmation email:', err)
    );

    // Send webhook to n8n (non-blocking)
    sendWebhook(submissionId, {
      type: 'private_dining',
      submission_id: submissionId,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        event_date: data.event_date,
        guest_count: guestCount,
        event_type: data.event_type,
        special_requests: data.message
      }
    }).catch(err =>
      console.error('Failed to send webhook:', err)
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your private dining inquiry! Our events team will contact you within 24 hours.',
      id: submissionId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Private dining form error:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
