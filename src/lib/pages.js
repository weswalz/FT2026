// Pages service module
import getDb, { generateId, formatDate } from './database.js';

/**
 * Get all pages
 */
export function getAllPages(status = null) {
  const db = getDb();

  try {
    const stmt = status
      ? db.prepare('SELECT * FROM pages WHERE status = ? ORDER BY title ASC')
      : db.prepare('SELECT * FROM pages ORDER BY title ASC');

    const pages = status ? stmt.all(status) : stmt.all();

    return pages.map(page => ({
      ...page,
      sections: page.sections ? JSON.parse(page.sections) : []
    }));
  } catch (error) {
    console.error('[PAGES] Error getting pages:', error);
    return [];
  }
}

/**
 * Get page by slug
 */
export function getPageBySlug(slug) {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM pages WHERE slug = ?');
    const page = stmt.get(slug);

    if (!page) return null;

    return {
      ...page,
      sections: page.sections ? JSON.parse(page.sections) : []
    };
  } catch (error) {
    console.error('[PAGES] Error getting page:', error);
    return null;
  }
}

/**
 * Get page by ID
 */
export function getPageById(id) {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM pages WHERE id = ?');
    const page = stmt.get(id);

    if (!page) return null;

    return {
      ...page,
      sections: page.sections ? JSON.parse(page.sections) : []
    };
  } catch (error) {
    console.error('[PAGES] Error getting page:', error);
    return null;
  }
}

/**
 * Create page
 */
export function createPage(data) {
  const db = getDb();

  try {
    const id = generateId('page');
    const stmt = db.prepare(`
      INSERT INTO pages (id, slug, title, sections, seoTitle, seoDescription, seoKeywords, ogImage, status, createdAt, updatedAt, updatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sections = Array.isArray(data.sections) ? JSON.stringify(data.sections) : '[]';

    stmt.run(
      id,
      data.slug,
      data.title,
      sections,
      data.seoTitle || null,
      data.seoDescription || null,
      data.seoKeywords || null,
      data.ogImage || null,
      data.status || 'published',
      formatDate(),
      formatDate(),
      data.updatedBy || null
    );

    return { id, ...data };
  } catch (error) {
    console.error('[PAGES] Error creating page:', error);
    return null;
  }
}

/**
 * Update page
 */
export function updatePage(id, data) {
  const db = getDb();

  try {
    const sections = Array.isArray(data.sections) ? JSON.stringify(data.sections) : '[]';

    const stmt = db.prepare(`
      UPDATE pages
      SET slug = ?, title = ?, sections = ?, seoTitle = ?, seoDescription = ?, seoKeywords = ?, ogImage = ?, status = ?, updatedAt = ?, updatedBy = ?
      WHERE id = ?
    `);

    stmt.run(
      data.slug,
      data.title,
      sections,
      data.seoTitle || null,
      data.seoDescription || null,
      data.seoKeywords || null,
      data.ogImage || null,
      data.status || 'published',
      formatDate(),
      data.updatedBy || null,
      id
    );

    return true;
  } catch (error) {
    console.error('[PAGES] Error updating page:', error);
    return false;
  }
}

/**
 * Delete page
 */
export function deletePage(id) {
  const db = getDb();

  try {
    db.prepare('DELETE FROM pages WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('[PAGES] Error deleting page:', error);
    return false;
  }
}
