// Simple database initialization
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../database/fieldandtides.db');
const SCHEMA_PATH = join(__dirname, '../create-database.sql');

// Ensure database directory exists
const dbDir = dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database
const db = new Database(DB_PATH);
db.pragma('foreign_keys = OFF'); // Disable foreign keys during schema creation
db.pragma('journal_mode = WAL');

console.log('Reading schema...');
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

console.log('Executing schema...');
try {
  db.exec(schema);
  console.log('✅ Schema created successfully');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

// Re-enable foreign keys
db.pragma('foreign_keys = ON');

// Display stats
const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
const menus = db.prepare('SELECT COUNT(*) as count FROM menus').get();
const pages = db.prepare('SELECT COUNT(*) as count FROM pages').get();

console.log('\n✅ Database initialized successfully!');
console.log(`   Users: ${users.count}`);
console.log(`   Menus: ${menus.count}`);
console.log(`   Pages: ${pages.count}`);

db.close();
