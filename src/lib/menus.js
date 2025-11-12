// Menu service module
import getDb, { generateId, formatDate } from './database.js';

/**
 * Get all menus
 */
export function getAllMenus(status = 'published') {
  const db = getDb();

  try {
    const stmt = status
      ? db.prepare('SELECT * FROM menus WHERE status = ? ORDER BY displayOrder ASC')
      : db.prepare('SELECT * FROM menus ORDER BY displayOrder ASC');

    return status ? stmt.all(status) : stmt.all();
  } catch (error) {
    console.error('[MENUS] Error getting menus:', error);
    return [];
  }
}

/**
 * Get menu by ID or slug
 */
export function getMenu(identifier) {
  const db = getDb();

  try {
    const stmt = db.prepare('SELECT * FROM menus WHERE id = ? OR slug = ?');
    return stmt.get(identifier, identifier);
  } catch (error) {
    console.error('[MENUS] Error getting menu:', error);
    return null;
  }
}

/**
 * Get menu with items
 */
export function getMenuWithItems(identifier) {
  const db = getDb();

  try {
    const menu = getMenu(identifier);
    if (!menu) return null;

    const items = db.prepare(`
      SELECT * FROM menu_items
      WHERE menuId = ? AND status = 'published'
      ORDER BY section, displayOrder ASC
    `).all(menu.id);

    // Group items by section
    const sections = {};
    items.forEach(item => {
      const section = item.section || 'General';
      if (!sections[section]) {
        sections[section] = [];
      }
      // Parse dietary tags
      item.dietaryTags = item.dietaryTags ? JSON.parse(item.dietaryTags) : [];
      sections[section].push(item);
    });

    return {
      ...menu,
      sections
    };
  } catch (error) {
    console.error('[MENUS] Error getting menu with items:', error);
    return null;
  }
}

/**
 * Create menu
 */
export function createMenu(data) {
  const db = getDb();

  try {
    const id = generateId('menu');
    const stmt = db.prepare(`
      INSERT INTO menus (id, name, slug, description, displayOrder, status, category, createdAt, updatedAt, updatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      data.slug,
      data.description || null,
      data.displayOrder || 0,
      data.status || 'published',
      data.category || null,
      formatDate(),
      formatDate(),
      data.updatedBy || null
    );

    return { id, ...data };
  } catch (error) {
    console.error('[MENUS] Error creating menu:', error);
    return null;
  }
}

/**
 * Update menu
 */
export function updateMenu(id, data) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      UPDATE menus
      SET name = ?, slug = ?, description = ?, displayOrder = ?, status = ?, category = ?, updatedAt = ?, updatedBy = ?
      WHERE id = ?
    `);

    stmt.run(
      data.name,
      data.slug,
      data.description || null,
      data.displayOrder || 0,
      data.status || 'published',
      data.category || null,
      formatDate(),
      data.updatedBy || null,
      id
    );

    return true;
  } catch (error) {
    console.error('[MENUS] Error updating menu:', error);
    return false;
  }
}

/**
 * Delete menu
 */
export function deleteMenu(id) {
  const db = getDb();

  try {
    db.prepare('DELETE FROM menus WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('[MENUS] Error deleting menu:', error);
    return false;
  }
}

/**
 * Get all menu items for a menu
 */
export function getMenuItems(menuId) {
  const db = getDb();

  try {
    const items = db.prepare(`
      SELECT * FROM menu_items
      WHERE menuId = ?
      ORDER BY section, displayOrder ASC
    `).all(menuId);

    return items.map(item => ({
      ...item,
      dietaryTags: item.dietaryTags ? JSON.parse(item.dietaryTags) : []
    }));
  } catch (error) {
    console.error('[MENUS] Error getting menu items:', error);
    return [];
  }
}

/**
 * Create menu item
 */
export function createMenuItem(data) {
  const db = getDb();

  try {
    const id = generateId('menuitem');
    const stmt = db.prepare(`
      INSERT INTO menu_items (id, menuId, section, name, description, price, dietaryTags, image, displayOrder, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const dietaryTags = Array.isArray(data.dietaryTags) ? JSON.stringify(data.dietaryTags) : '[]';

    stmt.run(
      id,
      data.menuId,
      data.section || null,
      data.name,
      data.description || null,
      data.price || null,
      dietaryTags,
      data.image || null,
      data.displayOrder || 0,
      data.status || 'published',
      formatDate(),
      formatDate()
    );

    return { id, ...data };
  } catch (error) {
    console.error('[MENUS] Error creating menu item:', error);
    return null;
  }
}

/**
 * Update menu item
 */
export function updateMenuItem(id, data) {
  const db = getDb();

  try {
    const dietaryTags = Array.isArray(data.dietaryTags) ? JSON.stringify(data.dietaryTags) : '[]';

    const stmt = db.prepare(`
      UPDATE menu_items
      SET section = ?, name = ?, description = ?, price = ?, dietaryTags = ?, image = ?, displayOrder = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      data.section || null,
      data.name,
      data.description || null,
      data.price || null,
      dietaryTags,
      data.image || null,
      data.displayOrder || 0,
      data.status || 'published',
      formatDate(),
      id
    );

    return true;
  } catch (error) {
    console.error('[MENUS] Error updating menu item:', error);
    return false;
  }
}

/**
 * Delete menu item
 */
export function deleteMenuItem(id) {
  const db = getDb();

  try {
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    return true;
  } catch (error) {
    console.error('[MENUS] Error deleting menu item:', error);
    return false;
  }
}
