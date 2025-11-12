// Settings service module
import getDb, { generateId, formatDate } from './database.js';

/**
 * Get settings by category
 */
export function getSettings(category) {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM settings WHERE category = ?');
    const settings = stmt.get(category);

    if (!settings) return null;

    return {
      ...settings,
      data: settings.data ? JSON.parse(settings.data) : {}
    };
  } catch (error) {
    console.error('[SETTINGS] Error getting settings:', error);
    return null;
  }
}

/**
 * Get all settings
 */
export function getAllSettings() {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM settings');
    const settings = stmt.all();

    return settings.map(s => ({
      ...s,
      data: s.data ? JSON.parse(s.data) : {}
    }));
  } catch (error) {
    console.error('[SETTINGS] Error getting all settings:', error);
    return [];
  }
}

/**
 * Update or create settings
 */
export function updateSettings(category, data, updatedBy = null) {
  const db = getDb();

  try {
    const existing = db.prepare('SELECT id FROM settings WHERE category = ?').get(category);

    const jsonData = typeof data === 'object' ? JSON.stringify(data) : data;

    if (existing) {
      const stmt = db.prepare(`
        UPDATE settings
        SET data = ?, updatedAt = ?, updatedBy = ?
        WHERE category = ?
      `);

      stmt.run(jsonData, formatDate(), updatedBy, category);
    } else {
      const id = generateId('settings');
      const stmt = db.prepare(`
        INSERT INTO settings (id, category, data, updatedAt, updatedBy)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(id, category, jsonData, formatDate(), updatedBy);
    }

    return true;
  } catch (error) {
    console.error('[SETTINGS] Error updating settings:', error);
    return false;
  }
}

/**
 * Delete settings
 */
export function deleteSettings(category) {
  const db = getDb();

  try {
    db.prepare('DELETE FROM settings WHERE category = ?').run(category);
    return true;
  } catch (error) {
    console.error('[SETTINGS] Error deleting settings:', error);
    return false;
  }
}
