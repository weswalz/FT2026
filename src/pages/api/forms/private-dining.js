// POST /api/forms/private-dining
import { createSubmission } from '../../../lib/forms.js';
import { sendToN8nWebhook } from '../../../lib/webhook.js';

export async function POST({ request }) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.eventDate || !data.guestCount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, event date, and guest count are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
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
      formType: 'private_dining',
      name: data.name,
      email: data.email,
      payload: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        eventDate: data.eventDate,
        alternativeDate: data.alternativeDate || null,
        guestCount: data.guestCount,
        budget: data.budget || null,
        eventType: data.eventType || 'Private Dining',
        dietaryRestrictions: data.dietaryRestrictions || null,
        specialRequests: data.specialRequests || null,
        message: data.message || null
      },
      status: 'new',
      webhookStatus: 'pending'
    });

    if (!submission) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to save submission'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send to n8n webhook asynchronously (don't wait for response)
    sendToN8nWebhook(submission.id, submission.payload).catch(error => {
      console.error('[API] Webhook error:', error);
    });

    // TODO: Send email notification (optional)
    // await sendEmailNotification(submission);

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your private dining inquiry! Our events team will contact you within 24 hours.',
      submissionId: submission.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Private dining form error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
