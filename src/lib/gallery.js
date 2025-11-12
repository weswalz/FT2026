// Gallery service module
import getDb, { generateId, formatDate } from './database.js';

/**
 * Get all gallery images
 */
export function getAllImages() {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM gallery_images ORDER BY displayOrder ASC, createdAt DESC');
    const images = stmt.all();

    return images.map(img => ({
      ...img,
      tags: img.tags ? JSON.parse(img.tags) : []
    }));
  } catch (error) {
    console.error('[GALLERY] Error getting images:', error);
    return [];
  }
}

/**
 * Get featured images
 */
export function getFeaturedImages() {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM gallery_images WHERE featured = 1 ORDER BY displayOrder ASC');
    const images = stmt.all();

    return images.map(img => ({
      ...img,
      tags: img.tags ? JSON.parse(img.tags) : []
    }));
  } catch (error) {
    console.error('[GALLERY] Error getting featured images:', error);
    return [];
  }
}

/**
 * Get images by tag
 */
export function getImagesByTag(tag) {
  const db = getDb();

  try {
    const images = getAllImages();
    return images.filter(img => img.tags.includes(tag));
  } catch (error) {
    console.error('[GALLERY] Error getting images by tag:', error);
    return [];
  }
}

/**
 * Get image by ID
 */
export function getImageById(id) {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM gallery_images WHERE id = ?');
    const image = stmt.get(id);

    if (!image) return null;

    return {
      ...image,
      tags: image.tags ? JSON.parse(image.tags) : []
    };
  } catch (error) {
    console.error('[GALLERY] Error getting image:', error);
    return null;
  }
}

/**
 * Create gallery image
 */
export function createImage(data) {
  const db = getDb();

  try {
    const id = generateId('image');
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : '[]';

    const stmt = db.prepare(`
      INSERT INTO gallery_images (
        id, filename, originalName, url, title, caption, credit, tags,
        featured, mimetype, size, alt, displayOrder, createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.filename,
      data.originalName,
      data.url,
      data.title || null,
      data.caption || null,
      data.credit || null,
      tags,
      data.featured ? 1 : 0,
      data.mimetype || null,
      data.size || null,
      data.alt || null,
      data.displayOrder || 0,
      formatDate()
    );

    return { id, ...data };
  } catch (error) {
    console.error('[GALLERY] Error creating image:', error);
    return null;
  }
}

/**
 * Update gallery image
 */
export function updateImage(id, data) {
  const db = getDb();

  try {
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : '[]';

    const stmt = db.prepare(`
      UPDATE gallery_images
      SET title = ?, caption = ?, credit = ?, tags = ?, featured = ?, alt = ?, displayOrder = ?
      WHERE id = ?
    `);

    stmt.run(
      data.title || null,
      data.caption || null,
      data.credit || null,
      tags,
      data.featured ? 1 : 0,
      data.alt || null,
      data.displayOrder || 0,
      id
    );

    return true;
  } catch (error) {
    console.error('[GALLERY] Error updating image:', error);
    return false;
  }
}

/**
 * Delete gallery image
 */
export function deleteImage(id) {
  const db = getDb();

  try {
    db.prepare('DELETE FROM gallery_images WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('[GALLERY] Error deleting image:', error);
    return false;
  }
}
