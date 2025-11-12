// Authentication middleware for admin routes
import { getUserFromCookie } from './auth.js';

/**
 * Check if user is authenticated
 */
export function requireAuth(request) {
  const user = getUserFromCookie(request.cookies);

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Redirect to login if not authenticated
 */
export function redirectIfNotAuthenticated(request, redirectTo = '/admin/login') {
  const user = getUserFromCookie(request.cookies);

  if (!user) {
    return Response.redirect(new URL(redirectTo, request.url));
  }

  return user;
}

/**
 * Get client IP address
 */
export function getClientIp(request) {
  // Check headers set by reverse proxies
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to direct connection (may be proxy IP)
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

/**
 * Get user agent
 */
export function getUserAgent(request) {
  return request.headers.get('user-agent') || 'unknown';
}
