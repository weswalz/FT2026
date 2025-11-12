// POST /api/auth/login
import { validateCredentials, createSession } from '../../../lib/auth.js';
import { getClientIp } from '../../../lib/auth-middleware.js';

export async function POST({ request, cookies }) {
  try {
    const data = await request.json();
    const { username, password } = data;

    if (!username || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username and password are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get client IP
    const ipAddress = getClientIp(request);

    // Validate credentials
    const user = await validateCredentials(username, password, ipAddress);

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid credentials or account locked'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create session
    const session = createSession(user.id);

    if (!session) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create session'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set session cookie
    cookies.set('ft_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt
    });

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
