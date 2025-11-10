import { db } from '../../lib/database.js';

export const prerender = false;

export async function GET() {
  try {
    // Check database connection
    const result = db.prepare('SELECT 1 as health').get();

    const status = {
      status: 'healthy',
      database: result?.health === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
