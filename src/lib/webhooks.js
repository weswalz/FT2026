import { updateWebhookStatus } from './forms.js';

// Send webhook with retry logic
export async function sendWebhook(submissionId, payload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_URL not configured, skipping webhook');
    return { success: false, error: 'Webhook not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret || ''
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      await updateWebhookStatus(submissionId, 'sent');
      return { success: true };
    } else {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return { success: false, error: error.message };
  }
}

// Process webhook queue with exponential backoff
export async function processWebhookQueue() {
  const { getPendingWebhookSubmissions } = await import('./forms.js');
  const pending = getPendingWebhookSubmissions();

  for (const submission of pending) {
    const payload = JSON.parse(submission.payload);
    const attempts = submission.webhook_attempts + 1;

    // Exponential backoff: 2^attempts seconds
    const backoffMs = Math.pow(2, attempts) * 1000;
    const lastAttempt = submission.webhook_last_attempt ? new Date(submission.webhook_last_attempt) : null;

    // Check if enough time has passed since last attempt
    if (lastAttempt && Date.now() - lastAttempt.getTime() < backoffMs) {
      continue; // Skip this submission for now
    }

    const result = await sendWebhook(submission.id, {
      submission_id: submission.id,
      form_type: submission.form_type,
      data: payload,
      created_at: submission.created_at
    });

    if (!result.success) {
      const newStatus = attempts >= 3 ? 'failed' : 'pending';
      await updateWebhookStatus(submission.id, newStatus, attempts);
    }
  }
}
