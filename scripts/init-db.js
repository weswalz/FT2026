import { initDatabase } from '../src/lib/database.js';
import { ensureAdminExists } from '../src/lib/auth.js';
import { createMenu, createMenuItem } from '../src/lib/menus.js';
import { createPage } from '../src/lib/pages.js';

async function initializeDatabase() {
  console.log('Initializing database...');

  // Create tables
  initDatabase();

  // Create admin user
  await ensureAdminExists();

  // Create sample menus
  console.log('Creating sample menus...');

  const dinnerId = createMenu({
    name: 'Dinner Menu',
    slug: 'dinner',
    description: 'Our evening menu featuring seasonal and locally sourced ingredients',
    display_order: 1,
    status: 'published'
  });

  createMenu({
    name: 'Lunch Menu',
    slug: 'lunch',
    description: 'Light, fresh options for your midday meal',
    display_order: 2,
    status: 'published'
  });

  createMenu({
    name: 'Brunch Menu',
    slug: 'brunch',
    description: 'Weekend brunch favorites',
    display_order: 3,
    status: 'published'
  });

  // Add sample dinner items
  createMenuItem({
    menu_id: dinnerId,
    section: 'Starters',
    name: 'Coastal Oysters',
    description: 'Fresh Gulf oysters on the half shell with mignonette',
    price: '$18',
    tags: ['fresh', 'local'],
    dietary_info: ['gluten-free'],
    display_order: 1
  });

  createMenuItem({
    menu_id: dinnerId,
    section: 'Starters',
    name: 'Heirloom Tomato Salad',
    description: 'Local heirloom tomatoes, burrata, basil, balsamic reduction',
    price: '$14',
    tags: ['seasonal', 'vegetarian'],
    dietary_info: ['vegetarian', 'gluten-free'],
    display_order: 2
  });

  createMenuItem({
    menu_id: dinnerId,
    section: 'Entrees',
    name: 'Gulf Red Snapper',
    description: 'Pan-seared snapper with lemon butter, seasonal vegetables',
    price: '$34',
    tags: ['fresh', 'local', 'sustainable'],
    dietary_info: ['gluten-free'],
    display_order: 1
  });

  createMenuItem({
    menu_id: dinnerId,
    section: 'Entrees',
    name: 'Dry-Aged Ribeye',
    description: '16oz dry-aged ribeye, herb butter, roasted potatoes',
    price: '$52',
    tags: ['signature'],
    dietary_info: ['gluten-free'],
    display_order: 2
  });

  // Create sample pages
  console.log('Creating sample pages...');

  createPage({
    slug: 'homepage',
    title: 'Welcome to Field & Tides',
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Field & Tides',
          subtitle: 'Coastal dining in the heart of Houston Heights',
          image: '/images/hero-home.jpg'
        }
      },
      {
        type: 'text',
        content: {
          heading: 'Our Philosophy',
          body: 'At Field & Tides, we celebrate the bounty of land and sea with a menu that reflects the seasons and our commitment to local, sustainable sourcing.'
        }
      }
    ],
    seo_meta: {
      title: 'Field & Tides Restaurant & Bar | Houston Heights',
      description: 'Coastal dining in Houston Heights featuring seasonal menus and fresh Gulf seafood.',
      keywords: 'restaurant, houston, heights, seafood, farm to table'
    },
    status: 'published'
  });

  createPage({
    slug: 'ourstory',
    title: 'Our Story',
    sections: [
      {
        type: 'text',
        content: {
          heading: 'Our Story',
          body: 'Field & Tides opened in Houston\'s historic Heights neighborhood with a vision to bring coastal-inspired dining to the heart of the city...'
        }
      }
    ],
    seo_meta: {
      title: 'Our Story | Field & Tides',
      description: 'Learn about the story behind Field & Tides restaurant.',
      keywords: 'about us, restaurant story, chef'
    },
    status: 'published'
  });

  createPage({
    slug: 'policies',
    title: 'Policies',
    sections: [
      {
        type: 'text',
        content: {
          heading: 'Reservation Policy',
          body: 'We accept reservations up to 30 days in advance. Cancellations must be made at least 24 hours prior to your reservation time.'
        }
      },
      {
        type: 'text',
        content: {
          heading: 'Dietary Accommodations',
          body: 'We are happy to accommodate dietary restrictions. Please inform your server of any allergies or dietary needs.'
        }
      }
    ],
    seo_meta: {
      title: 'Policies | Field & Tides',
      description: 'Restaurant policies and information.',
      keywords: 'policies, reservations, dining'
    },
    status: 'published'
  });

  console.log('✓ Database initialized successfully!');
  console.log('✓ Admin user created');
  console.log('✓ Sample menus created');
  console.log('✓ Sample pages created');
  console.log('\nYou can now run: npm run dev');
}

// Run initialization
initializeDatabase().catch(error => {
  console.error('Error initializing database:', error);
  process.exit(1);
});
