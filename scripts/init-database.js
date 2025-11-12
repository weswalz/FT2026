#!/usr/bin/env node

// Database initialization script
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { hashPassword } from '../src/lib/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../database/fieldandtides.db');
const SCHEMA_PATH = join(__dirname, '../create-database.sql');

async function initDatabase() {
  console.log('🗄️  Initializing Field & Tides database...');

  try {
    // Ensure database directory exists
    const dbDir = dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('✅ Created database directory');
    }

    // Create database connection
    const db = new Database(DB_PATH);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');

    console.log('📄 Loading schema...');

    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);

    console.log('✅ Database schema created');

    // Check if we need to update admin password
    if (process.env.ADMIN_PASSWORD) {
      console.log('🔐 Updating admin password...');
      const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);

      const stmt = db.prepare(`
        UPDATE users SET password_hash = ? WHERE username = 'admin'
      `);

      stmt.run(passwordHash);
      console.log('✅ Admin password updated');
    }

    // Display statistics
    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      menus: db.prepare('SELECT COUNT(*) as count FROM menus').get().count,
      menuItems: db.prepare('SELECT COUNT(*) as count FROM menu_items').get().count,
      pages: db.prepare('SELECT COUNT(*) as count FROM pages').get().count,
      settings: db.prepare('SELECT COUNT(*) as count FROM settings').get().count
    };

    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${stats.users}`);
    console.log(`   Menus: ${stats.menus}`);
    console.log(`   Menu Items: ${stats.menuItems}`);
    console.log(`   Pages: ${stats.pages}`);
    console.log(`   Settings: ${stats.settings}`);

    db.close();

    console.log('\n✅ Database initialization complete!');
    console.log(`📍 Database location: ${DB_PATH}`);

    if (!process.env.ADMIN_PASSWORD) {
      console.log('\n⚠️  WARNING: Using default admin password');
      console.log('   Username: admin');
      console.log('   Password: changeme');
      console.log('   Please change this in production!');
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initDatabase();
