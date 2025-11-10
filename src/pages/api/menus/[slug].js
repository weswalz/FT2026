import { getMenuWithItems } from '../../../lib/menus.js';

export const prerender = false;

export async function GET({ params }) {
  try {
    const { slug } = params;

    if (!slug) {
      return new Response(JSON.stringify({
        error: 'Menu slug is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const menu = getMenuWithItems(slug);

    if (!menu) {
      return new Response(JSON.stringify({
        error: 'Menu not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      menu
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Menu API error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch menu'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
      });
  }
}
