import { db, prepare } from './database.js';

// Get all pages
export function getAllPages(statusFilter = null) {
  let query = 'SELECT * FROM pages';
  if (statusFilter) {
    query += ' WHERE status = ?';
  }
  query += ' ORDER BY title ASC';

  const stmt = prepare(query);
  return statusFilter ? stmt.all(statusFilter) : stmt.all();
}

// Get page by slug
export function getPageBySlug(slug) {
  const stmt = prepare('SELECT * FROM pages WHERE slug = ? AND status = ?');
  const page = stmt.get(slug, 'published');

  if (page) {
    return {
      ...page,
      sections: page.sections ? JSON.parse(page.sections) : [],
      seo_meta: page.seo_meta ? JSON.parse(page.seo_meta) : {}
    };
  }

  return null;
}

// Get page by ID
export function getPageById(id) {
  const stmt = prepare('SELECT * FROM pages WHERE id = ?');
  const page = stmt.get(id);

  if (page) {
    return {
      ...page,
      sections: page.sections ? JSON.parse(page.sections) : [],
      seo_meta: page.seo_meta ? JSON.parse(page.seo_meta) : {}
    };
  }

  return null;
}

// Create page
export function createPage(data) {
  const stmt = prepare(`
    INSERT INTO pages (slug, title, sections, seo_meta, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.slug,
    data.title,
    data.sections ? JSON.stringify(data.sections) : null,
    data.seo_meta ? JSON.stringify(data.seo_meta) : null,
    data.status || 'published'
  );

  return result.lastInsertRowid;
}

// Update page
export function updatePage(id, data) {
  const stmt = prepare(`
    UPDATE pages
    SET slug = ?, title = ?, sections = ?, seo_meta = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    data.slug,
    data.title,
    data.sections ? JSON.stringify(data.sections) : null,
    data.seo_meta ? JSON.stringify(data.seo_meta) : null,
    data.status || 'published',
    id
  );
}

// Delete page
export function deletePage(id) {
  const stmt = prepare('DELETE FROM pages WHERE id = ?');
  stmt.run(id);
}
