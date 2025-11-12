// Webhook utilities for n8n integration
import { updateWebhookStatus } from './forms.js';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // ms

/**
 * Send data to n8n webhook
 */
export async function sendToN8nWebhook(submissionId, payload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('[WEBHOOK] N8N_WEBHOOK_URL not configured');
    updateWebhookStatus(submissionId, 'failed', 'Webhook URL not configured');
    return false;
  }

  const data = {
    submissionId,
    timestamp: new Date().toISOString(),
    ...payload
  };

  // Try sending with retries
  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`[WEBHOOK] Sending to n8n (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})...`);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log('[WEBHOOK] ✅ Successfully sent to n8n');
        updateWebhookStatus(submissionId, 'sent', responseText || 'Success');
        return true;
      } else {
        console.error(`[WEBHOOK] Failed with status ${response.status}`);

        // If not the last attempt, retry
        if (attempt < MAX_RETRY_ATTEMPTS - 1) {
          await delay(RETRY_DELAYS[attempt]);
          continue;
        }

        // Last attempt failed
        const errorText = await response.text();
        updateWebhookStatus(submissionId, 'failed', `HTTP ${response.status}: ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error(`[WEBHOOK] Error on attempt ${attempt + 1}:`, error);

      // If not the last attempt, retry
      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        await delay(RETRY_DELAYS[attempt]);
        continue;
      }

      // Last attempt failed
      updateWebhookStatus(submissionId, 'failed', error.message);
      return false;
    }
  }

  return false;
}

/**
 * Delay helper for retries
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send test webhook
 */
export async function sendTestWebhook() {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return { success: false, error: 'Webhook URL not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Test webhook from Field & Tides'
      })
    });

    if (response.ok) {
      const responseText = await response.text();
      return { success: true, response: responseText };
    } else {
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
