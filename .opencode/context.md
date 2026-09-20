# Project Context

## Environment
- **Language:** Python 3.13 (backend), JavaScript/React 18 (frontend)
- **Backend:** Flask-Smorest 0.47, marshmallow 4.3, SQLAlchemy, Flask-Login
- **Frontend:** React 18, Vite 5, Tailwind CSS, Framer Motion, Phosphor Icons
- **Database:** Neon Postgres (serverless), psycopg2-binary
- **Email:** Resend SDK (test mode: `delivered@resend.dev`)
- **Deploy:** Vercel (backend + frontend), `npx vercel --prod --yes` from project root
- **Repo:** `https://github.com/Ayyankhan101/SimpleCRM`, branch `develop`
- **Login:** `demo@example.com` / `demo123`
- **Production URL:** `https://frontend-navy-psi-33.vercel.app`

## Current Status

### Completed (verified)
- Full SimpleCRM transformation (Data Analysis → SimpleCRM)
- Frontend redesign: Login, Register, Dashboard, Contacts, Deals, Activities, Contact Detail
- All CRUD verified for contacts, deals, activities
- Search + stage/type filters on all list pages
- Dark/light mode toggle (18 files)
- Kanban Pipeline feature
- Auth flow (401 JSON response, `lastRedirect` 2s cooldown)
- CORS fix (`FRONTEND_URL` env var)
- PUT endpoint field whitelists (contacts, deals, activities)
- Activity completion toggle, Contact search `?search=`
- Schema hardened (no 'churned' stage, `dump_only` on owner_id/org_id)
- 404 catch-all, `/v1/stats` endpoint (single API call)
- CSV import (preview + import + modal UI)
- Email validation fix (`fields.Email` → `fields.Str(allow_none=True)` + `@pre_load`)
- Activity Reminders (daily cron, overdue/today/upcoming emails)
- Daily Digest email
- Rate limiting (Postgres store, not memory)
- Full QA: 76/76 PASS
- DX Review: score 4.3/10, fixes applied (commits `c929390`, `41df627`)
- GitHub repo description updated
- Latest commit: `41df627`

### Pending — Email Integration (Plan Written, Not Executed)

Plan saved in memory. 3 tasks:

**Task 1: Backend endpoint** — `POST /api/v1/emails/send`
- Create `api/app/api_v1/emails.py`
- Register blueprint in `api/app/api_v1/__init__.py` and `api/app/__init__.py`
- Add to CSRF exempt list (line 93)
- Uses existing `send_email(to, subject, html)` from `services/email.py`
- Sanitizes with `html.escape()`, creates Activity(type='email')

**Task 2: Frontend modal** — ContactDetail.jsx
- Add email state: `showEmailModal`, `emailForm`, `sendingEmail`, `emailError`
- Add `handleSendEmail()` handler (POST to `/v1/emails/send`)
- Add "Send Email" button in contact header
- Add compose modal with subject/body fields

**Task 3: Deploy + verify**
- `npx vercel --prod --yes`
- curl test endpoint
- Verify UI renders

### User Questions (Unanswered)
1. Scope: Just ContactDetail, or also Deals page?
2. Rich text: Plain textarea or rich editor?
3. CC/BCC: MVP without or include?

## Key Files
| File | Purpose |
|------|---------|
| `api/app/__init__.py` | App factory, blueprint registration, CSRF exempt (line 93) |
| `api/app/api_v1/__init__.py` | Blueprint definitions, stats endpoint |
| `api/app/api_v1/contacts.py` | Contact CRUD |
| `api/app/api_v1/deals.py` | Deal CRUD |
| `api/app/api_v1/activities.py` | Activity CRUD |
| `api/app/api_v1/reminders.py` | Email reminder cron |
| `api/app/services/email.py` | Resend email service (`send_email(to, subject, html)`) |
| `api/app/models.py` | Contact, Deal, Activity, Tag, AuditLog models |
| `api/app/schemas/__init__.py` | Marshmallow schemas (Email uses `fields.Str` not `fields.Email`) |
| `frontend/src/pages/ContactDetail.jsx` | Contact detail page (393 lines, needs email modal) |
| `frontend/src/pages/Activities.jsx` | Activities list page |

## Architecture Notes
- Backend is Flask-Smorest API on Vercel serverless
- Frontend is React SPA on Vercel
- Session-based auth with cookies (SameSite)
- All API routes under `/api/v1/`
- `marshmallow 4` does NOT have `allow_blank` on `fields.Email`
- Swagger UI doesn't render in Vercel serverless
- `RESEND_TEST_MODE=true` routes to `delivered@resend.dev`
