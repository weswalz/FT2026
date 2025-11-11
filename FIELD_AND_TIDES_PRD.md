# Field & Tides Website & Admin Panel – Product Requirements Document (PRD)

## 1. Executive Summary
- **Client:** Field & Tides (upscale coastal-inspired restaurant)
- **Deliverable:** Fully content-populated marketing website plus headless-style admin panel modeled after BiYu Boxing’s Astro-based CMS.
- **Primary Goals:**
  - Modernize Field & Tides’ web presence with a fast, on-brand SSR site.
  - Give restaurant staff a secure, easy admin to maintain menus, media, and landing pages.
  - Centralize lead-capture flows (contact, general inquiries, private dining) with automated notifications (email + n8n).
  - Provide reusable image modules & gallery tools to keep photography fresh without relaunches.

## 2. Success Metrics
1. **Operational:** All 18 pages routed, populated, QA’d, and editable in the admin by launch.
2. **Performance:** Lighthouse 85+ performance and 95+ accessibility on homepage & menu pages.
3. **CMS Adoption:** Staff can add/update menu items, galleries, and page copy without dev help (measured via training sign-off).
4. **Lead Flow:** Private dining form triggers n8n workflow within 1 minute; confirmation email auto-sent to guest.

## 3. Target Audience & Personas
| Persona | Needs | Admin Usage |
|---------|------|-------------|
| **Guests & Foodies** | Fast access to menus, vibe, location, and gift cards from mobile. | None |
| **Event Coordinator** | Private event info, quick inquiry form, reassurance on policies. | Reviews private dining submissions exported via admin. |
| **Restaurant GM / Marketing Lead** | Update menus, upload seasonal photography, post announcements. | Primary admin users. |
| **Executive Chef** | Control menu accuracy and formatting, preview before publish. | Occasional admin usage for menu edits. |

## 4. Scope
### 4.1 In-Scope
- Astro SSR site with the 18 specified routes, each wired to CMS content types.
- Admin panel cloned from BiYu reference (theme updated to Field & Tides palette).
- SQLite content database (menus, pages, media, forms) + migrations script.
- REST-style API routes for forms (contact, private dining, image upload stub).
- n8n webhook integration from private dining form submission pipeline.
- Email notifications via existing SMTP or transactional service (configurable env vars).

### 4.2 Out-of-Scope / Future
- E-commerce or reservations integrations (OpenTable, Resy) beyond linking out.
- POS sync / live menu pricing automation.
- Multi-language localization.
- Headless publishing to native mobile apps.

## 5. Content Types & Admin Requirements
### 5.1 Menu
- **Fields:** title, slug, category (dinner, brunch, wine…), section order, item groups.
- **Menu Item Fields:** name, description, dietary tags, price (string to allow “MP”), optional image.
- **Features:** Drag-sorting of sections/items; preview toggle (draft vs live).
- **Pages using data:** `/menu-*` family plus homepage sections.

### 5.2 Gallery
- **Fields:** image file, title/caption, credit, tags (e.g., “interior”, “chef”).
- **Features:** Reorder support, hero vs grid variations, ability to attach to homepage or gallery module.

### 5.3 Contact Form
- **Fields Collected:** name, email, phone, message topic, message body.
- **Processing:** Save in DB table, send confirmation email, forward to contact distribution list.
- **Admin:** View submissions, mark as handled, export CSV.

### 5.4 Private Dining Request
- **Fields:** name, company, date preference, guest count, budget, dietary needs, notes.
- **Automation:** API route writes to DB, queues n8n webhook payload, emails coordinator + requester.
- **Admin:** Status tracking (new, in-progress, closed) + internal notes.

### 5.5 Image Module
- **Purpose:** Content editors can embed curated image blocks (single hero, diptych, carousel) inside page sections.
- **Fields:** module type, linked gallery images, overlay copy, CTA button optional.
- **Usage:** Homepage, Our Story, Private Events, Menu pages.

## 6. Pages & Content Mapping
| Page | URL | Data Sources | Notes |
|------|-----|--------------|-------|
| Homepage | `/` | Hero blocks, featured menus, image modules, CTA to private events | On-brand layout with accent palette. |
| Menu pages (12 total) | `/menu`, `/menu-dinner`, etc. | Menu content filtered by category | Keep consistent layout; allow anchor navigation. |
| Dessert/Cocktails/Ports, Dessert | dedicated menu categories sharing components. |
| Our Story | `/ourstory` | Rich text + image modules + gallery embed. |
| Private Events | `/private-events` | Page copy + private dining form embed + testimonials. |
| Contact | `/contact` | Contact info + general inquiry form. |
| Policies | `/policies` | Static content (editable). |
| Location | `/location` | Map embed, parking info, hours. |
| Gift Cards | `/giftcards` | CTA to purchase (external link) + FAQs. |

## 7. User Experience & Design
- **Look & Feel:** Coastal sophisticated; palette anchored by `#114C87` (navy), `#F4E297` (champagne gold), `#FEFDFC` (soft white), `#081928` (deep navy). Accent suggestions: warm copper `#C07A3A` or muted teal `#3D6C72`.
- **Typography:** Elegant serif for headings (e.g., Playfair Display) + clean sans for body (Inter/Source Sans). Configure via CSS variables to stay themeable.
- **Layouts:** Reuse admin panel structure but update branding, plus front-end layouts using shared components (hero, menu sections, galleries, CTA banners).
- **Accessibility:** WCAG 2.2 AA contrast, focus states, keyboard nav. All forms ARIA-labeled.
- **Responsive:** Mobile-first; ensure menus collapse into accordions on phones.

## 8. Admin Panel UX (Field & Tides Edition)
- Reuse BiYu Astro admin scaffolding.
- Update branding (logo, palette) and section labels (Menus, Galleries, Forms, Pages, Media).
- Modules:
  1. **Dashboard:** KPIs (active menus, upcoming events, pending leads).
  2. **Menus:** CRUD UI with inline item editing + reorder handles.
  3. **Gallery:** Image upload, tagging, selection for modules.
  4. **Pages:** Rich text sections (Markdown/blocks) referencing image modules.
  5. **Forms:** Submission inbox (contact + private dining) with filters/status.
  6. **Settings:** Hours, contact info, SEO metadata, gift card link.

## 9. Integrations
- **n8n:** Private dining POST -> queue job -> HTTP webhook; include payload (submission id, JSON, timestamp). Retry logic with exponential backoff.
- **Email:** Use SMTP creds via env (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Provide templated confirmation emails per form.
- **Maps:** Reuse existing embed (Mapbox or Google Maps) configured via env/per-page data.

## 10. Functional Requirements
1. **Content Editing:** All page content editable via admin (text blocks, sections, SEO meta).
2. **Menu Versioning:** Track last-updated timestamp + author per section.
3. **Media Handling:** Upload to `/public/uploads` (or S3-ready abstraction). Auto-generate responsive sizes.
4. **Form Validation:** Server-side validation, rate limiting, honeypot for spam.
5. **Search:** Admin global search for menu items, pages, submissions.
6. **Preview Mode:** Temporary signed URL for editors to preview unpublished menu changes.

## 11. Non-Functional Requirements
- **Performance:** TTFB < 200ms on menu pages (US visitors), Core Web Vitals passing.
- **Security:** HTTPS enforced, HTTP-only cookies, CSRF on forms, audit logs.
- **Reliability:** Admin + public site monitored; error logging to file + console.
- **Scalability:** Able to migrate to PostgreSQL later (data layer abstraction).
- **Compliance:** Privacy policy page, GDPR-compliant forms (consent check).

## 12. Environment & Configuration
- `.env` entries for DB path, SMTP, session secret, Cloudflare cache key (if used), n8n webhook URL, captcha secret (optional).
- Distinct configs for staging vs production (ports, DB copies).

## 13. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Staff unfamiliar with admin | Delays content updates | Provide training doc + screencast; include inline tooltips. |
| Menu data complexity | Inconsistent formatting | Enforce structured fields + validation, allow freeform notes. |
| n8n webhook failure | Missed leads | Queue + retry, highlight failed deliveries in admin dashboard. |
| Performance hit from large galleries | Slow page loads | Use responsive images, lazy loading, optional CDN. |

## 14. Acceptance Criteria
1. All 18 routes accessible, server-rendered, themed, and populated with initial provided copy & images.
2. Admin panel supports CRUD for menu, gallery, pages, forms without console errors.
3. Forms persist data, send email confirmations, and (for private dining) log webhook status.
4. Lighthouse/perf targets met on staging.
5. Documentation delivered (admin user guide + deployment steps).

## 15. Launch Checklist
- ✅ Content migrated & double-checked against provided HTML references.
- ✅ DNS + SSL configured.
- ✅ PM2 processes for site + n8n hook tested.
- ✅ Backup & rollback plan documented.
- ✅ Stakeholder UAT sign-off.
