# Field & Tides Restaurant Website

A modern, full-stack restaurant website built with Astro 5.x SSR, Tailwind CSS, and SQLite. Features a custom CMS (ReaktPanel) for menu management, form handling with email/webhook integrations, and a beautiful coastal-inspired design.

## 🌊 Features

- **Modern Stack**: Astro 5.x SSR with React islands, Tailwind CSS 3+
- **Custom CMS**: ReaktPanel admin interface for content management
- **18 Public Pages**: Homepage, multiple menu pages, contact, private events, and more
- **Dynamic Menus**: Database-driven menu system with real-time updates
- **Form Processing**: Contact and private dining forms with email notifications
- **Webhook Integration**: n8n integration for private dining inquiries
- **Security**: Argon2 authentication, CSRF protection, rate limiting
- **SEO Optimized**: Server-side rendering, structured data, meta tags
- **Performance**: Lighthouse ≥85 Performance, ≥95 Accessibility targets
- **Responsive Design**: Mobile-first, coastal bistro aesthetic

## 📋 Tech Stack

- **Framework**: Astro 5.x (SSR mode)
- **Styling**: Tailwind CSS 3+ with custom design system
- **Database**: SQLite via better-sqlite3
- **Authentication**: Argon2 password hashing
- **Email**: Nodemailer SMTP integration
- **Runtime**: Node.js 22 LTS
- **Package Manager**: npm

## 🚀 Quick Start

### Prerequisites

- Node.js 22 LTS or higher
- npm 9+ or yarn/pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FT2026
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run db:init
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:4321
   ```

### Default Admin Credentials

- **Username**: admin
- **Password**: admin123

⚠️ **Change these credentials immediately in production!**

## 📁 Project Structure

```
FT2026/
├── src/
│   ├── components/          # Reusable Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── SEO.astro
│   │   ├── MenuSection.astro
│   │   └── ContactForm.astro
│   ├── layouts/             # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/               # Route pages (file-based routing)
│   │   ├── index.astro      # Homepage
│   │   ├── menu.astro       # Menu overview
│   │   ├── menu-dinner.astro
│   │   ├── contact.astro
│   │   ├── admin/           # Admin panel pages
│   │   │   ├── index.astro
│   │   │   ├── login.astro
│   │   │   ├── auth.js
│   │   │   └── logout.js
│   │   └── api/             # API endpoints
│   │       ├── contact.js
│   │       ├── private-dining.js
│   │       ├── health.js
│   │       └── menus/[slug].js
│   ├── lib/                 # Business logic & utilities
│   │   ├── database.js      # Database connection & schema
│   │   ├── auth.js          # Authentication functions
│   │   ├── security.js      # Security utilities
│   │   ├── menus.js         # Menu CRUD operations
│   │   ├── pages.js         # Page CRUD operations
│   │   ├── forms.js         # Form submission handling
│   │   ├── gallery.js       # Gallery/image management
│   │   ├── email.js         # Email sending
│   │   └── webhooks.js      # n8n webhook integration
│   └── styles/
│       └── global.css       # Global styles & Tailwind
├── public/                  # Static assets
│   ├── images/              # Image assets
│   └── uploads/             # User-uploaded files
├── database/                # SQLite database files
│   └── fieldandtides.db
├── scripts/
│   └── init-db.js          # Database initialization script
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind configuration
└── package.json
```

## 🎨 Design System

### Color Palette

- **Deep Navy**: `#114C87` - Primary brand color
- **Champagne Gold**: `#F4E297` - Accent & CTAs
- **Lily White**: `#FEFDFC` - Background
- **Midnight**: `#081928` - Text & dark elements
- **Copper**: `#C07A3A` - Optional accent

### Typography

- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Key Components

- Sticky translucent navigation with backdrop blur
- Card-style menus with rounded corners and soft shadows
- Fade-in scroll animations
- Coastal texture overlays
- Responsive grid layouts

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_PATH=./database/fieldandtides.db

# Session Security
SESSION_SECRET=your-random-secret-here

# SMTP Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@fieldandtides.com

# n8n Webhook
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/private-dining
N8N_WEBHOOK_SECRET=your-webhook-secret

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password

# Environment
NODE_ENV=development
```

### SMTP Setup

The application supports any SMTP provider. For development, you can use:

- **Mailhog**: Local SMTP testing server
- **Mailtrap**: Email testing service
- **Gmail**: Configure with app password
- **SendGrid**: Production email service

### n8n Integration

1. Set up an n8n workflow with a webhook trigger
2. Configure the webhook URL in `.env`
3. Private dining submissions will be sent to n8n
4. Includes retry logic with exponential backoff

## 📊 Database Schema

The SQLite database includes these main tables:

- `users` - Admin user accounts
- `sessions` - User sessions
- `menus` - Menu categories
- `menu_items` - Individual menu items
- `pages` - Content pages
- `gallery_images` - Image assets
- `form_submissions` - Contact & private dining forms
- `rate_limits` - Rate limiting
- `audit_log` - Admin action logging

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Preview production build
npm run preview

# Initialize/reset database
npm run db:init

# Type checking
npm run astro check
```

### Adding New Menu Items

1. Log in to admin panel: `/admin/login`
2. Navigate to Menus section
3. Select a menu or create new one
4. Add menu items with sections, prices, descriptions

### Creating New Pages

Pages are file-based in `src/pages/`. To add a new page:

1. Create `src/pages/your-page.astro`
2. Use `BaseLayout` for consistent structure
3. Add navigation link in `Header.astro`
4. Deploy - changes are immediate

## 🚀 Deployment

### Production Build

```bash
npm run build
```

This creates a `dist/` directory with:
- `client/` - Static assets
- `server/` - Node.js server bundle

### Server Requirements

- Node.js 22 LTS
- Ubuntu 24.04 LTS (recommended)
- Nginx (reverse proxy)
- PM2 (process manager)
- SSL certificate

### PM2 Setup

Create `ecosystem.config.cjs`:

```javascript
module.exports = {
  apps: [{
    name: 'field-tides',
    script: './dist/server/entry.mjs',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4321
    }
  }]
};
```

Start with PM2:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name fieldandtides.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fieldandtides.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🔐 Security

### Best Practices Implemented

- ✅ Argon2 password hashing
- ✅ HTTP-only session cookies
- ✅ CSRF token protection
- ✅ Rate limiting on login and API routes
- ✅ SQL injection prevention (prepared statements)
- ✅ File upload validation
- ✅ Audit logging for admin actions
- ✅ Environment variable secrets

### Production Checklist

- [ ] Change default admin credentials
- [ ] Set strong `SESSION_SECRET`
- [ ] Configure HTTPS/SSL
- [ ] Enable Nginx security headers
- [ ] Set up database backups
- [ ] Configure SMTP with real credentials
- [ ] Test n8n webhook integration
- [ ] Review rate limits
- [ ] Enable production error logging

## 📝 License

Copyright © 2025 Field & Tides Restaurant & Bar. All rights reserved.

## 🤝 Support

For issues or questions:
- Email: info@fieldandtides.com
- Admin Panel: https://fieldandtides.com/admin

---

Built with ❤️ using Astro, Tailwind CSS, and modern web technologies.
