# Field & Tides Restaurant Website

A modern, full-stack restaurant website built with Astro 5, featuring a complete admin panel for content management.

## Features

- **SSR-powered Frontend**: Fast, SEO-friendly pages built with Astro 5
- **Complete Admin Panel**: Full CRUD management for menus, pages, gallery, and forms
- **Database-driven**: SQLite database with Better-SQLite3
- **Form Submissions**: Contact and private dining inquiry forms
- **Webhook Integration**: Private dining forms trigger n8n webhooks
- **Responsive Design**: Mobile-first, Tailwind CSS styling
- **Authentication**: Secure session-based admin authentication

## Tech Stack

- **Framework**: Astro 5.15.5 (SSR mode)
- **Database**: SQLite with better-sqlite3 12.4.1
- **UI**: React 19.2.0 + Tailwind CSS 4.1.13
- **Authentication**: Argon2id password hashing
- **Icons**: Lucide Icons
- **Deployment**: Node.js with PM2

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

```bash
node scripts/init-database.js
```

### 3. Start Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:4321`

## Default Admin Credentials

**⚠️ Change these immediately in production!**

- Username: `admin`
- Password: `changeme`

## Project Structure

```
/
├── database/               # SQLite database
├── public/                 # Static assets
│   ├── images/            # Public images
│   └── uploads/           # User uploads
├── scripts/               # Database scripts
│   ├── init-database.js   # Initialize database
│   └── create-admin.js    # Create admin user
├── src/
│   ├── components/        # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ContactForm.astro
│   │   └── ...
│   ├── layouts/           # Page layouts
│   │   ├── Layout.astro            # Frontend layout
│   │   └── AdminLayout.astro       # Admin layout
│   ├── lib/               # Core modules
│   │   ├── auth.js        # Authentication
│   │   ├── database.js    # Database connection
│   │   ├── menus.js       # Menu service
│   │   ├── pages.js       # Pages service
│   │   ├── forms.js       # Forms service
│   │   ├── gallery.js     # Gallery service
│   │   ├── settings.js    # Settings service
│   │   └── webhook.js     # Webhook integration
│   ├── pages/             # Frontend & Admin pages
│   │   ├── api/           # API routes
│   │   │   ├── auth/
│   │   │   └── forms/
│   │   ├── admin/         # Admin panel
│   │   │   ├── dashboard.astro
│   │   │   ├── menus.astro
│   │   │   ├── gallery.astro
│   │   │   ├── pages.astro
│   │   │   ├── forms.astro
│   │   │   └── settings.astro
│   │   ├── index.astro         # Homepage
│   │   ├── menu-*.astro        # Menu pages
│   │   ├── contact.astro       # Contact page
│   │   ├── private-events.astro
│   │   └── ...
│   └── styles/            # CSS files
│       ├── global.css     # Global styles
│       └── admin.css      # Admin styles
├── .env                   # Environment variables
├── astro.config.mjs       # Astro configuration
├── tailwind.config.mjs    # Tailwind configuration
└── package.json
```

## Admin Panel

Access the admin panel at `/admin/login`

### Features:
- **Dashboard**: Overview with statistics
- **Menus**: Manage menu categories and items
- **Gallery**: Upload and manage images
- **Pages**: Edit page content and SEO
- **Forms**: View and manage submissions
- **Settings**: Configure site settings

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### Forms
- `POST /api/forms/contact` - Submit contact form
- `POST /api/forms/private-dining` - Submit private dining inquiry

## Environment Variables

Create a `.env` file with these variables:

```env
DATABASE_PATH=./database/fieldandtides.db
SESSION_SECRET=your-secret-key-here
ADMIN_PASSWORD=your-secure-password
N8N_WEBHOOK_URL=your-webhook-url
SITE_URL=https://fieldandtides.com
NODE_ENV=development
```

## Building for Production

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Start with PM2

```bash
npm run build
pm2 start ecosystem.config.cjs
```

## Database Management

### Initialize Database
```bash
node scripts/init-database.js
```

### Create New Admin User
```bash
node scripts/create-admin.js
```

### Backup Database
```bash
cp database/fieldandtides.db database/backup-$(date +%Y%m%d).db
```

## Deployment

### Requirements
- Node.js 22 LTS or higher
- PM2 process manager
- Nginx (optional, for reverse proxy)

### Steps

1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Initialize database: `node scripts/init-database.js`
5. Build: `npm run build`
6. Start with PM2: `pm2 start ecosystem.config.cjs`
7. Configure Nginx reverse proxy (optional)

## Security Notes

- Change default admin credentials immediately
- Use strong SESSION_SECRET in production
- Enable HTTPS in production
- Configure firewall rules
- Regular database backups
- Keep dependencies updated

## Support

For issues or questions, contact the development team.

## License

Proprietary - Field & Tides Restaurant
