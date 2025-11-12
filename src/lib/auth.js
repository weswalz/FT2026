import argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { prepare } from './database.js';

// Hash password
export async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

// Verify password
export async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

// Create user
export async function createUser(username, password, role = 'admin') {
  const passwordHash = await hashPassword(password);
  const stmt = prepare(`
    INSERT INTO users (username, password_hash, role)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(username, passwordHash, role);
  return result.lastInsertRowid;
}

// Find user by username
export function findUserByUsername(username) {
  const stmt = prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

// Find user by ID
export function findUserById(id) {
  const stmt = prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

// Create session
export function createSession(userId) {
  const sessionId = nanoid(32);
  const csrfToken = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const stmt = prepare(`
    INSERT INTO sessions (id, user_id, csrf_token, expires_at)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(sessionId, userId, csrfToken, expiresAt.toISOString());

  return { sessionId, csrfToken, expiresAt };
}

// Get session
export function getSession(sessionId) {
  const stmt = prepare(`
    SELECT s.*, u.username, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `);

  return stmt.get(sessionId);
}

// Delete session
export function deleteSession(sessionId) {
  const stmt = prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(sessionId);
}

// Clean expired sessions
export function cleanExpiredSessions() {
  const stmt = prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now')`);
  return stmt.run();
}

// Verify CSRF token
export function verifyCSRFToken(sessionId, token) {
  const session = getSession(sessionId);
  return session && session.csrf_token === token;
}

// Log login attempt
export function logLoginAttempt(ipAddress, username, success) {
  const stmt = prepare(`
    INSERT INTO login_attempts (ip_address, username, success)
    VALUES (?, ?, ?)
  `);
  stmt.run(ipAddress, username, success ? 1 : 0);
}

// Check login attempts
export function checkLoginAttempts(ipAddress, timeWindowMinutes = 15, maxAttempts = 5) {
  const stmt = prepare(`
    SELECT COUNT(*) as count
    FROM login_attempts
    WHERE ip_address = ?
      AND success = 0
      AND created_at > datetime('now', '-' || ? || ' minutes')
  `);

  const result = stmt.get(ipAddress, timeWindowMinutes);
  return result.count >= maxAttempts;
}

// Initialize default admin user if none exists
export async function ensureAdminExists() {
  const stmt = prepare('SELECT COUNT(*) as count FROM users');
  const result = stmt.get();

  if (result.count === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    await createUser(username, password, 'admin');
    console.log(`Default admin user created: ${username}`);
  }
}
