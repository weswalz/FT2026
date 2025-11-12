# Field & Tides Web Platform – Architecture Guide

## 1. Overview
- **Stack:** Astro 5.x (SSR) + selective React islands, Tailwind CSS, TypeScript-friendly JS, SQLite via `better-sqlite3`.
- **Deployment:** Ubuntu 24.04 LTS, Node.js 22 LTS, PM2-managed Node server, Nginx reverse proxy (SSL termination, caching, security headers).
- **Modules:** Public site, REAKT PANEL admin, API routes, SQLite data layer, background job for n8n webhook retries.
- **Brand Palette:** `#114C87` (deep navy), `#F4E297` (gold), `#FEFDFC` (lily white), `#081928` (midnight). Accent suggestion `#C07A3A`.

## 2. System Diagram
```
Browser -> Nginx :443 -> PM2 -> Astro SSR App
                             |- Public Routes (/menu, /private-events, ...)
                             |- Admin Routes (/admin/*)
                             |- API Routes (/api/contact, /api/private-dining, /api/media)
Astro SSR -> better-sqlite3 -> SQLite DB (menus, pages, media, forms)
Astro SSR -> File System (/public/uploads) for media
Astro SSR -> SMTP + n8n webhook (outbound integrations)
```

## 3. Application Layers
1. **Routing Layer (Astro pages):**
   - `/src/pages` contains 18 public routes mapping 1:1 with requirements.
   - `prerender` disabled for dynamic routes to ensure fresh data.
   - Shared layouts handle header, footer, navigation, SEO tags.
2. **Admin Panel (REAKT PANEL):**
   - Lives under `/src/pages/admin` with identical structure to the REAKT PANEL reference.
   - `AdminLayout.astro` sets up nav, theme, Lucide icons, user menu.
   - Sections: Dashboard, Menus, Gallery, Pages, Forms, Settings.
3. **API Routes:**
   - Contact (`/src/pages/api/contact.js`) and Private Dining (`/src/pages/api/private-dining.js`) handle POSTs, validation, DB writes, email sending, and webhook queuing.
   - Media upload routes secure file uploads (size/type checks) and return paths for use in admin forms.
4. **Data Layer (Service Modules):**
   - `src/lib/database.js` centralizes `better-sqlite3` connection & queries.
   - Domain modules: `menus.js`, `gallery.js`, `pages.js`, `forms.js`, `image-modules.js`.
   - Encapsulate CRUD logic, slugging, ordering, and data normalization.
5. **Security & Auth:**
   - `src/lib/auth.js` handles Argon2 hashed credentials, session management (HTTP-only cookies, rotation, CSRF tokens).
   - `src/lib/auth-middleware.js` enforces guards on admin routes.
   - `src/lib/security.js` adds rate limiting, audit logs, and IP detection.
6. **Integrations Layer:**
   - `src/lib/email.js` abstracts SMTP sending for transactional emails.
   - `src/lib/webhooks.js` manages n8n POST with retry/backoff (stores status per submission).

## 4. Data Model
### SQLite Tables (core)
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `pages` | Structured sections per route | `slug`, `title`, `sections (JSON)`, `seo_meta`, `status` |
| `menus` | Menu categories | `id`, `name`, `slug`, `display_order`, `status` |
| `menu_items` | Items belonging to menus | `id`, `menu_id`, `section`, `name`, `description`, `price`, `tags`, `order` |
| `gallery_images` | Media assets | `id`, `file_path`, `title`, `caption`, `tags`, `featured` |
| `image_modules` | Reusable modules referencing galleries | `id`, `module_type`, `layout`, `content JSON` |
| `form_submissions` | Contact + private dining data | `id`, `form_type`, `payload JSON`, `status`, `webhook_status`, `created_at` |
| `users` | Admin accounts | `username`, `password_hash`, `role` |
| `sessions`, `login_attempts`, `rate_limits`, `audit_log` | Security and monitoring tables reused from the REAKT PANEL stack. |

### Relationships
- `menus` 1:N `menu_items`.
- `image_modules` reference `gallery_images` through join table (module_images) to support ordering.
- `pages.sections` can embed references to `image_modules` or `gallery_images`.
- `form_submissions` optionally reference follow-up tasks (future).

## 5. Theming & Design Tokens
- Global CSS variables defined in `src/styles/theme.css` (new file) carrying restaurant palette.
- Tailwind config extends color palette with `field`, `champagne`, `shell`, `midnight`.
- Admin CSS adapted from the REAKT PANEL base to reflect new branding while keeping structure.
- Do **not** import the legacy WordPress/Bricks helper bundles. The Astro build should recreate typography, layout, and animation from scratch (Tailwind tokens + bespoke components) so there are zero dependencies on exported `wp-content` assets.

## 6. Build & Deployment
- **Build command:** `npm run build` (Astro -> `/dist` server bundle).
- **Start command:** `npm run start` (`node ./dist/server/entry.mjs`).
- **PM2 Ecosystem:** `ecosystem.config.cjs` to manage `field-tides-app` (prod) + `field-tides-staging`.
- **Nginx:** Reverse proxy 80/443 to PM2 apps, adds HTTP/2, gzip, caching headers, and protects `/admin` with rate limits.
- **Media Storage:** Initially local file system under `public/uploads`; ready for S3 by swapping adapter.
- **Backups:** Nightly SQLite dump + uploads sync; store archives off-server.

## 7. Environments
| Env | URL | DB | SMTP | Notes |
|-----|-----|----|------|-------|
| Local Dev | `http://localhost:4321` | `database/fieldandtides.dev.db` | Mailhog or test creds | Feature work |
| Staging | `staging.fieldandtides.com` | `/var/www/fieldandtides/database/staging.db` | Real SMTP sandbox | Content QA |
| Production | `fieldandtides.com` | `/var/www/fieldandtides/database/prod.db` | Live SMTP | Launch |

Env-specific `.env` files store secrets (session, SMTP, n8n URL, CAPTCHA).

## 8. Security Considerations
- HTTPS enforced, HSTS enabled.
- Admin auth: no public login page; environment provisioned credentials.
- Sessions stored server-side (SQLite) with rotation + max age.
- CSRF tokens required for admin POST forms, plus audit logging.
- File uploads validated (MIME, size, extension); store outside SSR entrypoint until scanned.
- Rate limiting on API and admin login via `rate_limits` table.
- n8n webhook secrets stored in env; responses logged for traceability.

## 9. Monitoring & Logging
- Server logs: PM2 aggregated + rotated.
- Application logs: `console` + optional integration with a log shipper (e.g., vector).
- Health checks: simple `/api/health` returning DB connection status.
- Alerts: optional email/slack when private dining webhook failures exceed threshold.

## 10. Extensibility
- Data layer uses service modules, enabling migration to Postgres with minimal changes.
- Admin layout modular—new content types can be added by duplicating existing sections.
- API routes structured for easy addition (e.g., newsletter signup).
-
