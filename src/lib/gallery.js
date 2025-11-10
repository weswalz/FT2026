import { db, prepare } from './database.js';

// Get all gallery images
export function getAllImages(featured = null) {
  let query = 'SELECT * FROM gallery_images';
  if (featured !== null) {
    query += ' WHERE featured = ?';
  }
  query += ' ORDER BY display_order ASC, created_at DESC';

  const stmt = prepare(query);
  return featured !== null ? stmt.all(featured ? 1 : 0) : stmt.all();
}

// Get image by ID
export function getImageById(id) {
  const stmt = prepare('SELECT * FROM gallery_images WHERE id = ?');
  const image = stmt.get(id);

  if (image) {
    return {
      ...image,
      tags: image.tags ? JSON.parse(image.tags) : []
    };
  }

  return null;
}

// Create image
export function createImage(data) {
  const stmt = prepare(`
    INSERT INTO gallery_images (file_path, title, caption, tags, featured, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.file_path,
    data.title || null,
    data.caption || null,
    data.tags ? JSON.stringify(data.tags) : null,
    data.featured ? 1 : 0,
    data.display_order || 0
  );

  return result.lastInsertRowid;
}

// Update image
export function updateImage(id, data) {
  const stmt = prepare(`
    UPDATE gallery_images
    SET file_path = ?, title = ?, caption = ?, tags = ?, featured = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    data.file_path,
    data.title || null,
    data.caption || null,
    data.tags ? JSON.stringify(data.tags) : null,
    data.featured ? 1 : 0,
    data.display_order || 0,
    id
  );
}

// Delete image
export function deleteImage(id) {
  const stmt = prepare('DELETE FROM gallery_images WHERE id = ?');
  stmt.run(id);
}

// Get featured images for homepage
export function getFeaturedImages(limit = 6) {
  const stmt = prepare(`
    SELECT * FROM gallery_images
    WHERE featured = 1
    ORDER BY display_order ASC
    LIMIT ?
  `);

  return stmt.all(limit);
}
