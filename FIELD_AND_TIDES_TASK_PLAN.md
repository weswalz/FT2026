# Field & Tides Web Platform – Task Plan

## Phase 0 – Discovery & Setup
1. **Kickoff & Content Audit**
   - Gather final HTML references, imagery, menu spreadsheets.
   - Confirm integrations (SMTP, n8n endpoint, map provider).
2. **Repo Initialization**
   - Clone the REAKT PANEL baseline, create new branch `field-and-tides`.
   - Set up environment configs (.env.example).
3. **Database Schema Planning**
   - Draft SQLite schema for menus, pages, gallery, forms, modules.
   - Write migration script (`scripts/migrate-field-and-tides.js`).

## Phase 1 – Core Platform Foundations
1. **Branding & Theming**
   - Update Tailwind + CSS tokens with palette, typography.
   - Swap logos, favicons, meta defaults.
   - Recreate typography + theming directly in Tailwind/CSS tokens; remove all reliance on exported WordPress assets so the Astro build is self-contained.
2. **Routing Skeleton**
   - Create 18 Astro routes under `src/pages` with layout scaffolding.
   - Ensure nav/footer includes all menu links + gift card CTA.
3. **Data Layer Implementation**
   - Build `src/lib/menus.js`, `gallery.js`, `pages.js`, `forms.js`, `imageModules.js`.
   - Seed sample data for QA.

## Phase 2 – Admin Panel Customization
1. **Layout & Navigation**
   - Update `AdminLayout` branding, nav labels, dashboard stats.
2. **Menus Module**
   - CRUD UI for categories/sections/items, drag-reorder, preview toggle.
3. **Gallery & Image Module UIs**
   - Upload form with validation, tagging, hero/grid selection.
   - Image module builder referencing gallery assets.
4. **Pages Module**
   - Interface to manage page sections (hero, text blocks, image modules, CTAs).
5. **Forms Module**
   - Inbox views for contact + private dining, status updates, CSV export.

## Phase 3 – Public Site Development
1. **Global Layouts**
   - Header, footer, navigation mega-menu for menus, CTA components.
   - SEO tags and OpenGraph defaults per page.
2. **Homepage & Hero Modules**
   - Build hero slider, featured menus, gallery teasers, CTA banners.
3. **Menu Pages**
   - Reusable component for menu sections, dietary tags, anchor nav.
   - Ensure category filters map to correct slug routes.
4. **Story/Private Events/Policies**
   - Rich text blocks, image modules, testimonials.
5. **Contact, Location, Gift Cards**
   - Form embeds, map, operational info, external gift card link.

## Phase 4 – Integrations & Automation
1. **Contact Form Pipeline**
   - Server validation, DB persistence, email notification, admin alert.
2. **Private Dining Workflow**
   - Extended form fields, asynchronous n8n webhook, retry job.
3. **Email Templates**
   - Confirmation + internal notification templates for both forms.
4. **Media Handling**
   - File upload route, responsive image processing (Sharp), cleanup job.

## Phase 5 – QA, Performance, Launch
1. **Content QA**
   - Cross-check each page vs provided HTML reference; stakeholder sign-off.
2. **Accessibility & Performance**
   - Lighthouse audits, fix contrast/focus issues, lazy-load heavy sections.
3. **Security Review**
   - Verify auth flow, rate limits, CSRF tokens, audit logs.
4. **Staging UAT**
   - Deploy to staging, run smoke tests, gather approvals.
5. **Production Launch**
   - Cut final content, run migrations, deploy via PM2 + Nginx updates.
6. **Post-Launch Monitoring**
   - Watch logs, ensure forms + webhooks functioning, handoff documentation.
