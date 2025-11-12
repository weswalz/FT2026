// POST /api/auth/login
import { validateCredentials, createSession } from '../../../lib/auth.js';
import { getClientIp, getUserAgent, logAudit } from '../../../lib/security.js';

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

    // Get client info
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Validate credentials
    const user = await validateCredentials(username, password, ipAddress);

    if (!user) {
      logAudit({
        action: 'LOGIN_FAILED',
        username,
        entity: 'auth',
        ipAddress,
        userAgent,
        details: { reason: 'Invalid credentials or account locked' }
      });

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
      logAudit({
        action: 'SESSION_CREATION_FAILED',
        userId: user.id,
        username: user.username,
        entity: 'auth',
        ipAddress,
        userAgent
      });

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

    // Log successful login
    logAudit({
      action: 'LOGIN_SUCCESS',
      userId: user.id,
      username: user.username,
      entity: 'auth',
      ipAddress,
      userAgent,
      details: { sessionId: session.sessionId }
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

    logAudit({
      action: 'LOGIN_ERROR',
      entity: 'auth',
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      details: { error: error.message }
    });

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
