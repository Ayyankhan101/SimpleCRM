# Project Context: Data-Analysis-App

## Environment
- **Stack:** Flask backend (Python) + React frontend (Vite)
- **Branch:** `develop`
- **Ports:** Backend 5000, Frontend 5173
- **Demo creds:** `demo@example.com` / `demo123`
- **Lint:** `ruff check` — 0 errors
- **Caveman mode:** FULL — active, persistent

## Current Status — ALL COMPLETE ✅

### M1 Backend (10/10) ✅
- SECRET_KEY from env var, rate limiting, category_id ownership validation
- get_trends days param fix, null checks on get_json
- Timeouts on external calls, try/except bulk_delete
- row-level import_csv errors, exception logging
- Default rate limits (200/min, 50/sec), storage_uri="memory://"

### M2 Frontend (8/8) ✅
- Double /api prefix fix, error feedback alerts, pagination >5 pages
- Search debounce 300ms, active_cases input, confirm password on Register
- Favicon

### M3 Config (6/6) ✅
- .env.example, Docker credentials secured, .gitignore
- CI pipeline (frontend jobs, codecov v4, develop branch triggers)

### M4 Engineering Review (10) ✅
- **Dockerfiles**: backend (Python 3.11-slim) + frontend (Node 18 + nginx)
- **N+1 Fix**: Category.data_entries backref lazy='joined'
- **CSV Streaming**: yield_per(1000) generator for large exports
- **CSRF Protection**: Flask-WTF CSRFProtect enabled (disabled in tests)
- **JWT_SECRET_KEY**: Mandatory, separate from SECRET_KEY
- **Password Complexity**: uppercase + lowercase + digit required (BE+FE)
- **Session Security**: HTTPONLY, SAMESITE='Lax', SECURE in prod

### M5 Security/Perf (12) ✅
- **Flask-Caching**: SimpleCache, 30s default, memoized on /countries, /categories, /breakdown
- **Code Splitting**: React.lazy() for Login, Register, Dashboard, DataEntries, Categories
- **Docker Compose**: Removed version, added JWT_SECRET_KEY + healthcheck

### Final Verification
- BE: 37/37 pass ✅ | FE: 59/59 pass ✅ | E2E: 9/9 pass ✅ | Lint: 0 errors ✅

## Pending Tasks
### M1-M7: All Complete ✅
- M1: Generalize Data Model — DataSource, NotificationConfig, metrics_json
- M2: Data Source Integration — Sources CRUD, sync, webhook receiver
- M3: Advanced Analytics — Growth rate, forecast, moving average, anomalies
- M4: Dashboard Overhaul — Recharts (Area/Pie/Bar), date range, Sources/Compare pages
- M5: Data Quality — CSV validation, ImportPreview, duplicate detection
- M6: Notifications — Email (SendGrid) + Webhook, test endpoint, frontend UI
- M7: Polish — Responsive, loading states, error handling

### Final Status
- Backend: 64 tests pass ✅
- Frontend: 59 tests pass ✅
- 7 pages: Dashboard, DataEntries, Categories, Sources, Compare, Notifications, Login/Register
- 7 backend blueprints: auth, data, categories, analytics, sources, webhooks, notifications
- 3 services: analytics, validation, notifications

## Known Issues / Notes
- Google OAuth NOT configured — needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
- No database migrations (SQLite for dev)
- No auth token refresh logic visible
- Port 5000 was hijacked by macOS AirPlay — user disabled it

## Key Files
- `backend/config.py`, `backend/run.py`, `backend/app/__init__.py`
- `backend/app/routes/auth.py`, `data.py`, `categories.py`, `analytics.py`
- `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`
- `frontend/src/context/AuthContext.jsx`, `pages/DataEntries.jsx`, `pages/Register.jsx`
- `docker-compose.yml`, `.github/workflows/ci.yml`
- `FIXES_SUMMARY.md`, `test_e2e.py`
