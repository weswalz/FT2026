// POST /api/auth/logout
import { deleteSession } from '../../../lib/auth.js';

export async function POST({ cookies }) {
  try {
    const token = cookies.get('ft_session')?.value;

    if (token) {
      deleteSession(token);
    }

    // Clear cookie
    cookies.delete('ft_session', {
      path: '/'
    });

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Logout error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
