import { db, prepare } from './database.js';

// Rate limiting
export function checkRateLimit(identifier, endpoint, maxRequests = 10, windowMinutes = 1) {
  // Clean old entries first
  const cleanStmt = prepare(`
    DELETE FROM rate_limits
    WHERE window_start < datetime('now', '-' || ? || ' minutes')
  `);
  cleanStmt.run(windowMinutes * 2); // Clean entries older than 2x window

  // Check current rate
  const checkStmt = prepare(`
    SELECT SUM(count) as total
    FROM rate_limits
    WHERE identifier = ?
      AND endpoint = ?
      AND window_start > datetime('now', '-' || ? || ' minutes')
  `);

  const result = checkStmt.get(identifier, endpoint, windowMinutes);
  const currentCount = result.total || 0;

  if (currentCount >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Increment counter
  const insertStmt = prepare(`
    INSERT INTO rate_limits (identifier, endpoint, count, window_start)
    VALUES (?, ?, 1, datetime('now'))
  `);
  insertStmt.run(identifier, endpoint);

  return true; // Within rate limit
}

// Audit logging
export function logAudit(userId, action, entityType = null, entityId = null, details = null, ipAddress = null) {
  const stmt = prepare(`
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    userId,
    action,
    entityType,
    entityId,
    details ? JSON.stringify(details) : null,
    ipAddress
  );
}

// Get client IP from request
export function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// Validate file upload
export function validateFileUpload(file, allowedTypes = [], maxSizeMB = 10) {
  const errors = [];

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  const ext = file.name.split('.').pop().toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (!allowedExtensions.includes(ext)) {
    errors.push(`File extension .${ext} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Sanitize filename
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// Generate secure random token
export function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate email format
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone format
export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

// Sanitize HTML input (basic)
export function sanitizeHTML(str) {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
