# Changelog

All notable changes to SimpleCRM will be documented in this file.

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
