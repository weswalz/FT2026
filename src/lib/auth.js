// Field & Tides Admin Authentication System
// Username/Password authentication with Argon2id hashing
// Database-backed sessions, lockout tracking, CSRF protection

import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import getDb, { generateId, formatDate } from './database.js';

const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hash password with Argon2id
 */
export async function hashPassword(password) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });
}

/**
 * Verify password against hash
 */
export async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('[AUTH] Password verification error:', error);
    return false;
  }
}

/**
 * Check if account is locked
 */
export function isAccountLocked(username) {
  const db = getDb();
  const now = Date.now();

  try {
    const stmt = db.prepare(`
      SELECT attempts, windowStart
      FROM rate_limits
      WHERE identifier = ? AND endpoint = 'login'
    `);

    const record = stmt.get(username);

    if (!record) return false;

    const windowStart = new Date(record.windowStart).getTime();
    const elapsed = now - windowStart;

    // If window expired, not locked
    if (elapsed > LOCKOUT_DURATION) {
      return false;
    }

    // If attempts exceeded, locked
    if (record.attempts >= MAX_ATTEMPTS) {
      const remaining = Math.ceil((LOCKOUT_DURATION - elapsed) / 60000);
      console.log(`[AUTH] Account ${username} locked. ${remaining} minutes remaining.`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[AUTH] Error checking lockout:', error);
    return false;
  }
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(username, ipAddress = null) {
  const db = getDb();

  try {
    const existing = db.prepare(`
      SELECT * FROM rate_limits
      WHERE identifier = ? AND endpoint = 'login'
    `).get(username);

    if (!existing) {
      db.prepare(`
        INSERT INTO rate_limits (id, identifier, endpoint, attempts, windowStart)
        VALUES (?, ?, 'login', 1, ?)
      `).run(generateId('ratelimit'), username, formatDate());
    } else {
      const newAttempts = existing.attempts + 1;
      db.prepare(`
        UPDATE rate_limits
        SET attempts = ?, windowStart = ?
        WHERE identifier = ? AND endpoint = 'login'
      `).run(newAttempts, formatDate(), username);

      if (newAttempts >= MAX_ATTEMPTS) {
        console.log(`[AUTH] 🔒 Account ${username} locked after ${newAttempts} failed attempts`);
      }
    }

    // Log the attempt
    db.prepare(`
      INSERT INTO login_attempts (id, username, ipAddress, success, createdAt)
      VALUES (?, ?, ?, 0, ?)
    `).run(generateId('login'), username, ipAddress, formatDate());

  } catch (error) {
    console.error('[AUTH] Error recording failed attempt:', error);
  }
}

/**
 * Clear failed attempts on successful login
 */
export function clearFailedAttempts(username) {
  const db = getDb();

  try {
    db.prepare(`
      DELETE FROM rate_limits
      WHERE identifier = ? AND endpoint = 'login'
    `).run(username);
  } catch (error) {
    console.error('[AUTH] Error clearing attempts:', error);
  }
}

/**
 * Validate credentials
 */
export async function validateCredentials(username, password, ipAddress = null) {
  if (!username || !password) {
    console.log('[AUTH] ❌ Missing credentials');
    return null;
  }

  // Check if account is locked
  if (isAccountLocked(username)) {
    return null;
  }

  const db = getDb();

  try {
    // Find user
    const user = db.prepare(`
      SELECT * FROM users WHERE username = ?
    `).get(username);

    if (!user) {
      console.log(`[AUTH] ❌ User not found: ${username}`);
      recordFailedAttempt(username, ipAddress);
      return null;
    }

    // Verify password
    const valid = await verifyPassword(user.password_hash, password);

    if (!valid) {
      console.log(`[AUTH] ❌ Invalid password for user: ${username}`);
      recordFailedAttempt(username, ipAddress);
      return null;
    }

    // Success!
    clearFailedAttempts(username);

    // Log successful login
    db.prepare(`
      INSERT INTO login_attempts (id, username, ipAddress, success, createdAt)
      VALUES (?, ?, ?, 1, ?)
    `).run(generateId('login'), username, ipAddress, formatDate());

    // Update last login
    db.prepare(`
      UPDATE users SET lastLogin = ? WHERE id = ?
    `).run(formatDate(), user.id);

    console.log(`[AUTH] ✅ User authenticated: ${username}`);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

  } catch (error) {
    console.error('[AUTH] Authentication error:', error);
    return null;
  }
}

/**
 * Create session
 */
export function createSession(userId) {
  const db = getDb();
  const token = randomUUID();
  const csrfToken = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  try {
    const sessionId = generateId('session');
    db.prepare(`
      INSERT INTO sessions (id, userId, token, csrfToken, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sessionId, userId, token, csrfToken, expiresAt.toISOString(), formatDate());

    return { sessionId, token, csrfToken, expiresAt };
  } catch (error) {
    console.error('[AUTH] Error creating session:', error);
    return null;
  }
}

/**
 * Validate session token
 */
export function validateSession(token) {
  if (!token) return null;

  const db = getDb();

  try {
    const session = db.prepare(`
      SELECT s.*, u.username, u.email, u.role
      FROM sessions s
      JOIN users u ON s.userId = u.id
      WHERE s.token = ?
    `).get(token);

    if (!session) {
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (now > expiresAt) {
      // Session expired, delete it
      db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
      return null;
    }

    return {
      id: session.userId,
      username: session.username,
      email: session.email,
      role: session.role,
      sessionId: session.id,
      csrfToken: session.csrfToken
    };
  } catch (error) {
    console.error('[AUTH] Error validating session:', error);
    return null;
  }
}

/**
 * Delete session (logout)
 */
export function deleteSession(token) {
  if (!token) return;

  const db = getDb();

  try {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  } catch (error) {
    console.error('[AUTH] Error deleting session:', error);
  }
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions() {
  const db = getDb();

  try {
    const result = db.prepare(`
      DELETE FROM sessions
      WHERE datetime(expiresAt) < datetime('now')
    `).run();

    if (result.changes > 0) {
      console.log(`[AUTH] Cleaned up ${result.changes} expired sessions`);
    }
  } catch (error) {
    console.error('[AUTH] Error cleaning up sessions:', error);
  }
}

/**
 * Get user from session cookie
 */
export function getUserFromCookie(cookies) {
  const token = cookies.get('ft_session')?.value;
  if (!token) return null;

  return validateSession(token);
}
