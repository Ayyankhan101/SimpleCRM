# Changelog

All notable changes to SimpleCRM will be documented in this file.

## [3.2.0] - 2026-09-22

### Added
- Backend deployed to Render (`https://simplecrm-e1rk.onrender.com`)
- 3-way theme toggle: CARGA (warm beige), Dark, Light
- Comprehensive E2E test suite: 30 API tests + 12 Playwright browser tests
- CORS configured for Vercel frontend origin
- `COOKIE_SECURE` env var for production cookie settings
- `render.yaml` for Render deployment

### Fixed
- Contact creation "Failed to save contact" false error — Flask 308 redirect on missing trailing slash caused axios to convert POST → GET. Added trailing slash to all list/create API calls.
- `ActivitySchema` missing `completed_at`, `deal_title`, `contact_name` fields — API never returned these fields. Added dump_only fields.
- Vercel `VITE_API_BASE_URL` missing `/api` suffix — caused CORS errors and login failures.

### Changed
- Project structure: `api/` → `backend/`
- Frontend on Vercel, backend on Render (was: both on Vercel serverless)
- README updated with Render deployment, 3-way theme, new env vars

### Removed
- 30 duplicate test contacts from Neon database (52 → 22 active)

## [3.1.0] - 2026-09-20

### Added
- Email sending from ContactDetail and Deals pages (via Resend)
- Email open/click tracking (webhook + Activity model fields)
- Dashboard analytics: revenue trend (LineChart), email engagement stats, activity breakdown (PieChart)
- Resend webhook endpoint (`POST /api/v1/webhooks/resend`)

### Removed
- `conductor/` directory (old data analytics project docs, no longer relevant)

## [3.0.1] - 2026-09-19

### Fixed
- CI workflow paths (`cd backend` → `cd api`) — CI was broken since rename
- Vercel routes for API docs (`/api/docs(.*)` → WSGI)
- Rate limiting now uses Postgres store (was `memory://`, broken in serverless)
- start.sh banner updated to "SimpleCRM"
- GitHub repo description updated

### Added
- CONTRIBUTING.md
- This CHANGELOG

## [3.0.0] - 2026-09-19

### Added
- Activity reminders + daily email digest via Resend
- Neon Postgres migration (persistent production DB)
- Dark/light/system mode toggle
- Kanban pipeline drag-and-drop view
- CSV contact import with preview
- Dashboard stats endpoint (`/v1/stats`) — single API call vs 3
- Server-side contact search (`?search=`)
- Activity overdue/due-today badges
- OAuth callback handling
- 404 catch-all route
- "Contact not found" state with back link

### Fixed
- 16 bugs across 2 QA sweeps
- Auth 401 infinite redirect loop (2s cooldown)
- PUT endpoint field whitelisting (prevent owner_id/org_id overwrite)
- Contact `full_name` showing "John None"
- Deal `value=0` treated as falsy
- Activity `completed_at` reset on uncomplete
- Theme toggle losing system preference
- `formatRelativeDate` year display
- `is_overdue` midnight boundary
- CSV skipped count inflated
- "matching contacts" label when searching
- User loader null guard
- AuditLog JSON crash guard

### Changed
- Dashboard uses single `/v1/stats` endpoint
- Error messages: JSON on all 401/404/405/500
- DRY: shared activity query helpers

## [2.0.0] - 2026-09-17

### Added
- Full CRUD for contacts, deals, activities
- Pipeline stage filters
- Stage-based Kanban board
- Google OAuth login
- Multi-tenant organization support
- Role-based access (owner/admin/member)

### Changed
- React frontend redesign
- Tailwind CSS styling
- Framer Motion animations
