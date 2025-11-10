import { db, prepare } from './database.js';

// Get all form submissions
export function getAllSubmissions(formType = null, status = null) {
  let query = 'SELECT * FROM form_submissions WHERE 1=1';
  const params = [];

  if (formType) {
    query += ' AND form_type = ?';
    params.push(formType);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const stmt = prepare(query);
  return stmt.all(...params);
}

// Get submission by ID
export function getSubmissionById(id) {
  const stmt = prepare('SELECT * FROM form_submissions WHERE id = ?');
  const submission = stmt.get(id);

  if (submission) {
    return {
      ...submission,
      payload: JSON.parse(submission.payload)
    };
  }

  return null;
}

// Create form submission
export function createSubmission(formType, payload) {
  const stmt = prepare(`
    INSERT INTO form_submissions (form_type, payload, status, webhook_status)
    VALUES (?, ?, 'new', 'pending')
  `);

  const result = stmt.run(formType, JSON.stringify(payload));
  return result.lastInsertRowid;
}

// Update submission status
export function updateSubmissionStatus(id, status) {
  const stmt = prepare(`
    UPDATE form_submissions
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(status, id);
}

// Update webhook status
export function updateWebhookStatus(id, status, attempts = null) {
  let query = `
    UPDATE form_submissions
    SET webhook_status = ?, webhook_last_attempt = CURRENT_TIMESTAMP
  `;

  const params = [status];

  if (attempts !== null) {
    query += ', webhook_attempts = ?';
    params.push(attempts);
  }

  query += ' WHERE id = ?';
  params.push(id);

  const stmt = prepare(query);
  stmt.run(...params);
}

// Get pending webhook submissions
export function getPendingWebhookSubmissions(maxAttempts = 3) {
  const stmt = prepare(`
    SELECT * FROM form_submissions
    WHERE webhook_status = 'pending'
      AND webhook_attempts < ?
    ORDER BY created_at ASC
    LIMIT 10
  `);

  return stmt.all(maxAttempts);
}

// Delete submission
export function deleteSubmission(id) {
  const stmt = prepare('DELETE FROM form_submissions WHERE id = ?');
  stmt.run(id);
}
