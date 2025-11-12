// Security utilities - CSRF, Rate Limiting, Audit Logging
import { randomUUID } from 'crypto';
import getDb, { generateId, formatDate } from './database.js';

// ============================================
// CSRF Protection
// ============================================

/**
 * Generate CSRF token for session
 */
export function generateCSRFToken(sessionId) {
  const db = getDb();
  const token = randomUUID();

  try {
    // Store token with session
    db.prepare(`
      UPDATE sessions
      SET csrfToken = ?
      WHERE id = ?
    `).run(token, sessionId);

    return token;
  } catch (error) {
    console.error('[SECURITY] Error generating CSRF token:', error);
    return null;
  }
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(sessionId, token) {
  if (!sessionId || !token) {
    console.log('[SECURITY] CSRF validation failed: Missing token or session');
    return false;
  }

  const db = getDb();

  try {
    const session = db.prepare(`
      SELECT csrfToken FROM sessions WHERE id = ?
    `).get(sessionId);

    if (!session || !session.csrfToken) {
      console.log('[SECURITY] CSRF validation failed: No token in session');
      return false;
    }

    // Timing-safe comparison
    const valid = session.csrfToken === token;

    if (!valid) {
      console.log('[SECURITY] CSRF validation failed: Token mismatch');
    }

    return valid;
  } catch (error) {
    console.error('[SECURITY] Error validating CSRF token:', error);
    return false;
  }
}

// ============================================
// Rate Limiting
// ============================================

/**
 * Check rate limit for endpoint
 * @param {string} identifier - IP address or user ID
 * @param {string} endpoint - Endpoint name (e.g., 'contact-form', 'login')
 * @param {number} maxAttempts - Maximum allowed attempts
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} { allowed: boolean, remaining: number, resetAt: Date }
 */
export function checkRateLimit(identifier, endpoint, maxAttempts = 10, windowMs = 60 * 60 * 1000) {
  const db = getDb();
  const now = Date.now();

  try {
    // Get existing rate limit record
    const record = db.prepare(`
      SELECT * FROM rate_limits
      WHERE identifier = ? AND endpoint = ?
    `).get(identifier, endpoint);

    if (!record) {
      // First attempt, create record
      db.prepare(`
        INSERT INTO rate_limits (id, identifier, endpoint, attempts, windowStart)
        VALUES (?, ?, ?, 1, ?)
      `).run(generateId('ratelimit'), identifier, endpoint, formatDate());

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: new Date(now + windowMs)
      };
    }

    const windowStart = new Date(record.windowStart).getTime();
    const elapsed = now - windowStart;

    // If window expired, reset
    if (elapsed > windowMs) {
      db.prepare(`
        UPDATE rate_limits
        SET attempts = 1, windowStart = ?
        WHERE identifier = ? AND endpoint = ?
      `).run(formatDate(), identifier, endpoint);

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: new Date(now + windowMs)
      };
    }

    // Within window, check if over limit
    if (record.attempts >= maxAttempts) {
      const resetAt = new Date(windowStart + windowMs);
      console.log(`[SECURITY] Rate limit exceeded for ${identifier} on ${endpoint}`);

      return {
        allowed: false,
        remaining: 0,
        resetAt: resetAt
      };
    }

    // Increment attempts
    db.prepare(`
      UPDATE rate_limits
      SET attempts = attempts + 1
      WHERE identifier = ? AND endpoint = ?
    `).run(identifier, endpoint);

    return {
      allowed: true,
      remaining: maxAttempts - record.attempts - 1,
      resetAt: new Date(windowStart + windowMs)
    };

  } catch (error) {
    console.error('[SECURITY] Error checking rate limit:', error);
    // Fail open (allow on error, but log)
    return {
      allowed: true,
      remaining: 0,
      resetAt: new Date(now + windowMs)
    };
  }
}

/**
 * Clear rate limit for identifier/endpoint
 */
export function clearRateLimit(identifier, endpoint) {
  const db = getDb();

  try {
    db.prepare(`
      DELETE FROM rate_limits
      WHERE identifier = ? AND endpoint = ?
    `).run(identifier, endpoint);
  } catch (error) {
    console.error('[SECURITY] Error clearing rate limit:', error);
  }
}

// ============================================
// Audit Logging
// ============================================

/**
 * Log audit event
 * @param {object} data - Audit data
 */
export function logAudit(data) {
  const db = getDb();

  try {
    const stmt = db.prepare(`
      INSERT INTO audit_log (
        id, userId, username, action, entity, entityId, details, ipAddress, userAgent, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      generateId('audit'),
      data.userId || null,
      data.username || null,
      data.action,
      data.entity || null,
      data.entityId || null,
      data.details ? JSON.stringify(data.details) : null,
      data.ipAddress || null,
      data.userAgent || null,
      formatDate()
    );

    console.log(`[AUDIT] ${data.action} by ${data.username || 'system'}`);
  } catch (error) {
    console.error('[SECURITY] Error logging audit:', error);
  }
}

/**
 * Get recent audit logs
 */
export function getAuditLogs(limit = 100, userId = null) {
  const db = getDb();

  try {
    let query = 'SELECT * FROM audit_log';
    const params = [];

    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }

    query += ' ORDER BY createdAt DESC LIMIT ?';
    params.push(limit);

    const logs = db.prepare(query).all(...params);

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  } catch (error) {
    console.error('[SECURITY] Error getting audit logs:', error);
    return [];
  }
}

// ============================================
// Client IP Detection
// ============================================

/**
 * Get client IP from request (handles proxies)
 */
export function getClientIp(request) {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take first IP from comma-separated list
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  // Fallback (may be proxy IP)
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request) {
  return request.headers.get('user-agent') || 'unknown';
}

// ============================================
// Security Headers
// ============================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response) {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS protection (legacy, but doesn't hurt)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return response;
}

// ============================================
// Input Sanitization
// ============================================

/**
 * Sanitize string input
 */
export function sanitizeString(input, maxLength = 1000) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (flexible)
 */
export function isValidPhone(phone) {
  // Allow digits, spaces, dashes, plus, parentheses
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
}
