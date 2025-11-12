// POST /api/forms/contact
import { createSubmission } from '../../../lib/forms.js';

export async function POST({ request }) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, and message are required'
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
      formType: 'contact',
      name: data.name,
      email: data.email,
      payload: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || 'General Inquiry',
        message: data.message
      },
      status: 'new'
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

    // TODO: Send email notification (optional)
    // await sendEmailNotification(submission);

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for contacting us! We\'ll get back to you soon.',
      submissionId: submission.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Contact form error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
