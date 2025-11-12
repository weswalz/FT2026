// Forms service module
import getDb, { generateId, formatDate } from './database.js';

/**
 * Get all form submissions
 */
export function getAllSubmissions(formType = null, status = null) {
  const db = getDb();

  try {
    let query = 'SELECT * FROM form_submissions WHERE 1=1';
    const params = [];

    if (formType) {
      query += ' AND formType = ?';
      params.push(formType);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY createdAt DESC';

    const stmt = db.prepare(query);
    const submissions = stmt.all(...params);

    return submissions.map(sub => ({
      ...sub,
      payload: sub.payload ? JSON.parse(sub.payload) : {}
    }));
  } catch (error) {
    console.error('[FORMS] Error getting submissions:', error);
    return [];
  }
}

/**
 * Get submission by ID
 */
export function getSubmissionById(id) {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM form_submissions WHERE id = ?');
    const submission = stmt.get(id);

    if (!submission) return null;

    return {
      ...submission,
      payload: submission.payload ? JSON.parse(submission.payload) : {}
    };
  } catch (error) {
    console.error('[FORMS] Error getting submission:', error);
    return null;
  }
}

/**
 * Create form submission
 */
export function createSubmission(data) {
  const db = getDb();

  try {
    const id = generateId('submission');
    const payload = typeof data.payload === 'object' ? JSON.stringify(data.payload) : data.payload;

    const stmt = db.prepare(`
      INSERT INTO form_submissions (
        id, formType, payload, email, name, status, webhookStatus,
        webhookAttempts, webhookLastAttempt, webhookResponse,
        internalNotes, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.formType,
      payload,
      data.email || null,
      data.name || null,
      data.status || 'new',
      data.webhookStatus || 'not_applicable',
      0,
      null,
      null,
      null,
      formatDate(),
      formatDate()
    );

    return { id, ...data };
  } catch (error) {
    console.error('[FORMS] Error creating submission:', error);
    return null;
  }
}

/**
 * Update submission status
 */
export function updateSubmissionStatus(id, status, internalNotes = null) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      UPDATE form_submissions
      SET status = ?, internalNotes = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(status, internalNotes, formatDate(), id);
    return true;
  } catch (error) {
    console.error('[FORMS] Error updating submission:', error);
    return false;
  }
}

/**
 * Update webhook status
 */
export function updateWebhookStatus(id, status, response = null) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      UPDATE form_submissions
      SET webhookStatus = ?, webhookAttempts = webhookAttempts + 1,
          webhookLastAttempt = ?, webhookResponse = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(status, formatDate(), response, formatDate(), id);
    return true;
  } catch (error) {
    console.error('[FORMS] Error updating webhook status:', error);
    return false;
  }
}

/**
 * Delete submission
 */
export function deleteSubmission(id) {
  const db = getDb();

  try {
    db.prepare('DELETE FROM form_submissions WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('[FORMS] Error deleting submission:', error);
    return false;
  }
}
