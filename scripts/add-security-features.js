#!/usr/bin/env node

// Migration to add security features
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../database/fieldandtides.db');

console.log('🔐 Adding security features to database...');

try {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = OFF');

  // Add CSRF token column to sessions
  console.log('Adding csrfToken column to sessions...');
  try {
    db.exec('ALTER TABLE sessions ADD COLUMN csrfToken TEXT');
    console.log('✅ Added csrfToken column');
  } catch (error) {
    if (error.message.includes('duplicate column')) {
      console.log('✓ csrfToken column already exists');
    } else {
      throw error;
    }
  }

  db.pragma('foreign_keys = ON');
  db.close();

  console.log('✅ Security features added successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
