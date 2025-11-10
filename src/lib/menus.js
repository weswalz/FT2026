import { db, prepare } from './database.js';

// Get all menus
export function getAllMenus(statusFilter = 'published') {
  let query = 'SELECT * FROM menus';
  if (statusFilter) {
    query += ' WHERE status = ?';
  }
  query += ' ORDER BY display_order ASC, name ASC';

  const stmt = prepare(query);
  return statusFilter ? stmt.all(statusFilter) : stmt.all();
}

// Get menu by slug
export function getMenuBySlug(slug) {
  const stmt = prepare('SELECT * FROM menus WHERE slug = ? AND status = ?');
  return stmt.get(slug, 'published');
}

// Get menu by ID
export function getMenuById(id) {
  const stmt = prepare('SELECT * FROM menus WHERE id = ?');
  return stmt.get(id);
}

// Get menu items for a menu
export function getMenuItems(menuId) {
  const stmt = prepare(`
    SELECT * FROM menu_items
    WHERE menu_id = ? AND status = 'published'
    ORDER BY display_order ASC, section ASC, name ASC
  `);
  return stmt.all(menuId);
}

// Get menu with items
export function getMenuWithItems(slug) {
  const menu = getMenuBySlug(slug);
  if (!menu) return null;

  const items = getMenuItems(menu.id);

  // Group items by section
  const sections = {};
  items.forEach(item => {
    const section = item.section || 'Main';
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push({
      ...item,
      tags: item.tags ? JSON.parse(item.tags) : [],
      dietary_info: item.dietary_info ? JSON.parse(item.dietary_info) : []
    });
  });

  return {
    ...menu,
    sections
  };
}

// Create menu
export function createMenu(data) {
  const stmt = prepare(`
    INSERT INTO menus (name, slug, description, display_order, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.name,
    data.slug,
    data.description || null,
    data.display_order || 0,
    data.status || 'published'
  );

  return result.lastInsertRowid;
}

// Update menu
export function updateMenu(id, data) {
  const stmt = prepare(`
    UPDATE menus
    SET name = ?, slug = ?, description = ?, display_order = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    data.name,
    data.slug,
    data.description || null,
    data.display_order || 0,
    data.status || 'published',
    id
  );
}

// Delete menu
export function deleteMenu(id) {
  const stmt = prepare('DELETE FROM menus WHERE id = ?');
  stmt.run(id);
}

// Create menu item
export function createMenuItem(data) {
  const stmt = prepare(`
    INSERT INTO menu_items (menu_id, section, name, description, price, tags, dietary_info, display_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.menu_id,
    data.section || null,
    data.name,
    data.description || null,
    data.price || null,
    data.tags ? JSON.stringify(data.tags) : null,
    data.dietary_info ? JSON.stringify(data.dietary_info) : null,
    data.display_order || 0,
    data.status || 'published'
  );

  return result.lastInsertRowid;
}

// Update menu item
export function updateMenuItem(id, data) {
  const stmt = prepare(`
    UPDATE menu_items
    SET menu_id = ?, section = ?, name = ?, description = ?, price = ?, tags = ?, dietary_info = ?, display_order = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    data.menu_id,
    data.section || null,
    data.name,
    data.description || null,
    data.price || null,
    data.tags ? JSON.stringify(data.tags) : null,
    data.dietary_info ? JSON.stringify(data.dietary_info) : null,
    data.display_order || 0,
    data.status || 'published',
    id
  );
}

// Delete menu item
export function deleteMenuItem(id) {
  const stmt = prepare('DELETE FROM menu_items WHERE id = ?');
  stmt.run(id);
}

// Get all menu items for admin
export function getAllMenuItemsAdmin(menuId = null) {
  let query = 'SELECT * FROM menu_items';
  if (menuId) {
    query += ' WHERE menu_id = ?';
  }
  query += ' ORDER BY display_order ASC, section ASC';

  const stmt = prepare(query);
  return menuId ? stmt.all(menuId) : stmt.all();
}
