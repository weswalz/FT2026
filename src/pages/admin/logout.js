import { deleteSession } from '../../lib/auth.js';

export const prerender = false;

export async function POST({ cookies, redirect }) {
  const sessionId = cookies.get('session_id')?.value;

  if (sessionId) {
    deleteSession(sessionId);
  }

  cookies.delete('session_id', { path: '/' });

  return redirect('/admin/login');
}
