#!/usr/bin/env node

// Script to create a new admin user
import { hashPassword } from '../src/lib/auth.js';
import getDb, { generateId, formatDate } from '../src/lib/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('🔐 Create New Admin User\n');

  try {
    const username = await question('Username: ');
    const password = await question('Password: ');
    const email = await question('Email (optional): ');

    if (!username || !password) {
      console.log('❌ Username and password are required');
      process.exit(1);
    }

    console.log('\n🔐 Hashing password...');
    const passwordHash = await hashPassword(password);

    console.log('💾 Creating user in database...');
    const db = getDb();

    const stmt = db.prepare(`
      INSERT INTO users (id, username, password_hash, email, role, createdAt)
      VALUES (?, ?, ?, ?, 'admin', ?)
    `);

    stmt.run(
      generateId('user'),
      username,
      passwordHash,
      email || null,
      formatDate()
    );

    console.log(`\n✅ Admin user created successfully!`);
    console.log(`   Username: ${username}`);

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.error('\n❌ Error: Username already exists');
    } else {
      console.error('\n❌ Error creating admin:', error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
