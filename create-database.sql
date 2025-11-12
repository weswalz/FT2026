-- Field & Tides Restaurant Database
-- SQLite Schema

-- Drop tables if they exist
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS gallery_images;
DROP TABLE IF EXISTS image_modules;
DROP TABLE IF EXISTS module_images;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS form_submissions;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS audit_log;

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  createdAt TEXT DEFAULT (datetime('now')),
  lastLogin TEXT
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  csrfToken TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Menu categories
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  displayOrder INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published', -- published, draft
  category TEXT, -- dinner, brunch, wine, cocktails, etc
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  updatedBy TEXT
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  menuId TEXT NOT NULL,
  section TEXT, -- appetizers, mains, desserts, etc
  name TEXT NOT NULL,
  description TEXT,
  price TEXT, -- String to allow "MP" (Market Price)
  dietaryTags TEXT, -- JSON: ["gluten-free", "vegan", etc]
  image TEXT,
  displayOrder INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (menuId) REFERENCES menus(id) ON DELETE CASCADE
);

-- Gallery images
CREATE TABLE IF NOT EXISTS gallery_images (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  originalName TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  credit TEXT,
  tags TEXT, -- JSON: ["interior", "chef", "food", etc]
  featured BOOLEAN DEFAULT false,
  mimetype TEXT,
  size INTEGER,
  alt TEXT,
  displayOrder INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Image modules (reusable image blocks for pages)
CREATE TABLE IF NOT EXISTS image_modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  moduleType TEXT, -- hero, grid, carousel, diptych, etc
  layout TEXT, -- full-width, contained, split, etc
  overlayText TEXT,
  ctaText TEXT,
  ctaLink TEXT,
  displayOrder INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Join table for image modules and gallery images
CREATE TABLE IF NOT EXISTS module_images (
  id TEXT PRIMARY KEY,
  moduleId TEXT NOT NULL,
  imageId TEXT NOT NULL,
  displayOrder INTEGER DEFAULT 0,
  FOREIGN KEY (moduleId) REFERENCES image_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (imageId) REFERENCES gallery_images(id) ON DELETE CASCADE
);

-- Pages with structured content
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  sections TEXT, -- JSON: array of sections with content
  seoTitle TEXT,
  seoDescription TEXT,
  seoKeywords TEXT,
  ogImage TEXT,
  status TEXT DEFAULT 'published',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  updatedBy TEXT
);

-- Form submissions (contact + private dining)
CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  formType TEXT NOT NULL, -- contact, private_dining
  payload TEXT NOT NULL, -- JSON with all form fields
  email TEXT,
  name TEXT,
  status TEXT DEFAULT 'new', -- new, in-progress, closed
  webhookStatus TEXT, -- pending, sent, failed, not_applicable
  webhookAttempts INTEGER DEFAULT 0,
  webhookLastAttempt TEXT,
  webhookResponse TEXT,
  internalNotes TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  category TEXT,
  data TEXT NOT NULL, -- JSON with settings
  updatedAt TEXT DEFAULT (datetime('now')),
  updatedBy TEXT
);

-- Media library
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  originalName TEXT NOT NULL,
  url TEXT NOT NULL,
  mimetype TEXT,
  size INTEGER,
  alt TEXT,
  category TEXT, -- general, menu, gallery, etc
  createdAt TEXT DEFAULT (datetime('now')),
  createdBy TEXT
);

-- Login attempts (security)
CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  success BOOLEAN DEFAULT false,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP or user ID
  endpoint TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  windowStart TEXT DEFAULT (datetime('now')),
  UNIQUE(identifier, endpoint)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  userId TEXT,
  username TEXT,
  action TEXT NOT NULL,
  entity TEXT, -- menus, pages, etc
  entityId TEXT,
  details TEXT, -- JSON with change details
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Insert default admin user (password: changeme - MUST be changed in production)
-- Password hash for 'changeme' using Argon2id
INSERT OR IGNORE INTO users (id, username, password_hash, email, role)
VALUES (
  'admin-default-001',
  'admin',
  '$argon2id$v=19$m=65536,t=3,p=4$NLvs2hixyiDST4BmZHf9Yg$mZiKg435IaPN3Bwzd3oiiLYGKb/5+lgFy12ncYDpqcU',
  'admin@fieldandtides.com',
  'admin'
);

-- Insert default settings
INSERT OR IGNORE INTO settings (id, category, data) VALUES
('settings-site-001', 'site', json('{"siteName":"Field & Tides","siteTagline":"Coastal Inspired Cuisine","contactEmail":"info@fieldandtides.com","contactPhone":"(555) 123-4567","address":"123 Main St, Houston, TX 77007","hours":{"monday":"11:00 AM - 10:00 PM","tuesday":"11:00 AM - 10:00 PM","wednesday":"11:00 AM - 10:00 PM","thursday":"11:00 AM - 10:00 PM","friday":"11:00 AM - 11:00 PM","saturday":"10:00 AM - 11:00 PM","sunday":"10:00 AM - 9:00 PM"}}'));

INSERT OR IGNORE INTO settings (id, category, data) VALUES
('settings-seo-001', 'seo', json('{"defaultTitle":"Field & Tides Restaurant & Bar","defaultDescription":"Field & Tides, located in Houston''s historic Heights neighborhood features an open canvas menu that reflects Executive Chef Travis Lenig''s culinary experiences.","defaultKeywords":"restaurant, Houston, Heights, seafood, farm-to-table, coastal cuisine"}'));

-- Insert sample menu
INSERT OR IGNORE INTO menus (id, name, slug, description, displayOrder, category) VALUES
('menu-dinner-001', 'Dinner Menu', 'dinner', 'Our signature dinner menu featuring the best of field and sea', 1, 'dinner'),
('menu-brunch-001', 'Brunch Menu', 'brunch', 'Weekend brunch favorites', 2, 'brunch'),
('menu-wine-001', 'Wine List', 'wine', 'Curated selection of wines', 3, 'wine'),
('menu-cocktails-001', 'Cocktails & Bar', 'cocktails', 'Handcrafted cocktails and spirits', 4, 'cocktails');

-- Insert sample menu items
INSERT OR IGNORE INTO menu_items (id, menuId, section, name, description, price, dietaryTags, displayOrder) VALUES
('item-001', 'menu-dinner-001', 'Appetizers', 'Gulf Oysters', 'Fresh Gulf oysters on the half shell with mignonette', 'MP', '["gluten-free"]', 1),
('item-002', 'menu-dinner-001', 'Appetizers', 'Crispy Brussels Sprouts', 'With bacon, pecans, and balsamic glaze', '14', '["vegetarian-option"]', 2),
('item-003', 'menu-dinner-001', 'Mains', 'Pan-Seared Salmon', 'With seasonal vegetables and lemon beurre blanc', '32', '["gluten-free"]', 3),
('item-004', 'menu-dinner-001', 'Mains', 'Beef Tenderloin', 'Aged beef with roasted fingerling potatoes', '48', '[]', 4);

-- Insert sample pages
INSERT OR IGNORE INTO pages (id, slug, title, sections, seoTitle, seoDescription, status) VALUES
('page-home-001', '', 'Home', json('[]'), 'Field & Tides Restaurant & Bar', 'Coastal inspired cuisine in Houston''''s Heights neighborhood', 'published'),
('page-story-001', 'ourstory', 'Our Story', json('[]'), 'Our Story - Field & Tides', 'Learn about our culinary journey and passion for coastal cuisine', 'published'),
('page-contact-001', 'contact', 'Contact Us', json('[]'), 'Contact - Field & Tides', 'Get in touch with Field & Tides restaurant', 'published'),
('page-policy-001', 'policies', 'Our Policies', json('[]'), 'Policies - Field & Tides', 'Restaurant policies and information', 'published'),
('page-location-001', 'location', 'Location', json('[]'), 'Location & Hours - Field & Tides', 'Find us in Houston''''s Heights neighborhood', 'published'),
('page-private-events-001', 'private-events', 'Private Events', json('[]'), 'Private Events - Field & Tides', 'Host your special event at Field & Tides', 'published'),
('page-giftcards-001', 'giftcards', 'Gift Cards', json('[]'), 'Gift Cards - Field & Tides', 'Give the gift of exceptional dining', 'published');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_menu_items_menuId ON menu_items(menuId);
CREATE INDEX IF NOT EXISTS idx_form_submissions_formType ON form_submissions(formType);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_userId ON audit_log(userId);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity);
