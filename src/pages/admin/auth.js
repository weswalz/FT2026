import { findUserByUsername, verifyPassword, createSession, logLoginAttempt, checkLoginAttempts } from '../../lib/auth.js';
import { getClientIP } from '../../lib/security.js';

export const prerender = false;

export async function POST({ request, redirect, cookies }) {
  try {
    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');
    const clientIP = getClientIP(request);

    // Check rate limiting
    if (checkLoginAttempts(clientIP)) {
      return new Response('Too many login attempts. Please try again later.', {
        status: 429,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Validate input
    if (!username || !password) {
      return new Response('Username and password are required', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Find user
    const user = findUserByUsername(username);

    if (!user) {
      logLoginAttempt(clientIP, username, false);
      return new Response('Invalid credentials', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Verify password
    const isValid = await verifyPassword(user.password_hash, password);

    if (!isValid) {
      logLoginAttempt(clientIP, username, false);
      return new Response('Invalid credentials', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Create session
    const { sessionId } = createSession(user.id);
    logLoginAttempt(clientIP, username, true);

    // Set session cookie
    cookies.set('session_id', sessionId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    });

    return redirect('/admin');
  } catch (error) {
    console.error('Auth error:', error);
    return new Response('Authentication failed', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
