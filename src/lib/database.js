import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path from environment or use default
const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../../database/fieldandtides.db');

// Ensure database directory exists
const dbDir = dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Performance optimizations
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = -64000'); // 64MB
    db.pragma('temp_store = MEMORY');
  }

  return db;
}

// Initialize database with schema
export function initializeDatabase() {
  const db = getDb();
  const schemaPath = join(__dirname, '../../create-database.sql');

  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('Database initialized successfully');
  } else {
    console.error('Database schema file not found');
  }
}

// Helper function to generate unique IDs
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
}

// Helper function to format dates for SQLite
export function formatDate(date = new Date()) {
  return date.toISOString();
}

// Transaction helper
export function transaction(fn) {
  const db = getDb();
  return db.transaction(fn);
}

// Close database connection
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// Export database instance
export default getDb;
