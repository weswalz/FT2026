import { createSubmission } from '../../lib/forms.js';
import { sendContactNotification, sendCustomerConfirmation } from '../../lib/email.js';
import { validateEmail, validatePhone, getClientIP } from '../../lib/security.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
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

    // Validate phone if provided
    if (data.phone && !validatePhone(data.phone)) {
      return new Response(JSON.stringify({
        error: 'Invalid phone number'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create submission record
    const submissionId = createSubmission('contact', {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      ip_address: getClientIP(request),
      submitted_at: new Date().toISOString()
    });

    // Send notification email (non-blocking)
    sendContactNotification(data).catch(err =>
      console.error('Failed to send notification email:', err)
    );

    // Send confirmation to customer (non-blocking)
    sendCustomerConfirmation(data.email, data.name, 'contact').catch(err =>
      console.error('Failed to send confirmation email:', err)
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you soon.',
      id: submissionId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
