import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../database/fieldandtides.db');
const dbDir = dirname(dbPath);

// Ensure database directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    -- Users table for admin authentication
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      csrf_token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Pages table for structured content
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      sections TEXT, -- JSON array of content sections
      seo_meta TEXT, -- JSON object with title, description, keywords
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Menus table
    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Menu items table
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_id INTEGER NOT NULL,
      section TEXT,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT,
      tags TEXT, -- JSON array
      dietary_info TEXT, -- JSON array (vegan, gluten-free, etc.)
      display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
    );

    -- Gallery images table
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      title TEXT,
      caption TEXT,
      tags TEXT, -- JSON array
      featured BOOLEAN DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Image modules table
    CREATE TABLE IF NOT EXISTS image_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_type TEXT NOT NULL, -- 'hero', 'diptych', 'carousel'
      layout TEXT, -- JSON configuration
      content TEXT, -- JSON with image references and settings
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Form submissions table
    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_type TEXT NOT NULL, -- 'contact' or 'private_dining'
      payload TEXT NOT NULL, -- JSON with form data
      status TEXT DEFAULT 'new', -- 'new', 'read', 'responded'
      webhook_status TEXT, -- 'pending', 'sent', 'failed'
      webhook_attempts INTEGER DEFAULT 0,
      webhook_last_attempt DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Login attempts for rate limiting
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      username TEXT,
      success BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Rate limits table
    CREATE TABLE IF NOT EXISTS rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL, -- IP or user ID
      endpoint TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Audit log table
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT, -- JSON
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
    CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
    CREATE INDEX IF NOT EXISTS idx_menus_slug ON menus(slug);
    CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON menu_items(menu_id);
    CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(form_type);
    CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, endpoint);
  `);

  console.log('Database initialized successfully');
}

// Helper function to create prepared statements
export function prepare(sql) {
  return db.prepare(sql);
}

// Transaction helper
export function transaction(fn) {
  return db.transaction(fn);
}

// Export database instance
export default db;
