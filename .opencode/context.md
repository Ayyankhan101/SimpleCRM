# Project Context

## Current Status
**Strip-down complete.** Project now SimpleCRM — contacts, deals, activities only.

### Completed This Session
- models.py: Removed DataEntry, DataSource, Category, NotificationConfig
- __init__.py: Removed non-CRM blueprints (data, categories, analytics, sources, notifications, webhooks)
- health.py: Removed DataEntry import, uses Contact/Deal/Activity counts
- schemas/__init__.py: Removed dead schemas (DataEntrySchema, DataSourceSchema, NotificationConfigSchema)
- Layout.jsx: Nav simplified to Dashboard, Contacts, Deals, Activities
- App.jsx: Routes simplified to Login, Register, Dashboard, Contacts, Deals, Activities
- Dashboard.jsx: Rewritten — 3 stat cards (contacts/deals/activities), pipeline bar chart, upcoming tasks
- requirements.txt: Removed pandas, celery, redis, sendgrid, boto3
- README.md: Rewritten for SimpleCRM product
- Tests: 54 pass (test_auth.py + test_crm.py)
- Frontend: Builds clean

### Backend Models (current)
User, Organization, Contact, Deal, Activity, Tag, AuditLog

### Backend Routes (current)
- auth.py (register/login/logout/me)
- health.py (health check)
- contacts.py (CRM CRUD)
- deals.py (CRM CRUD)
- activities.py (CRM CRUD)

### Login
- `admin@example.com` / `Admin456`
- `demo@example.com` / `demo123`

## Pending Tasks
1. **Delete dead test files** — test_data.py, test_categories.py, test_sources.py, test_notifications.py, test_analytics.py, test_validation.py, test_services.py, test_medium_gaps.py, test_api_gaps.py, test_comprehensive.py
2. **Update e2e_test.py** — remove non-CRM endpoint tests
3. **Deploy landing page** — landing.html to Vercel/Netlify
4. **Start outreach** — per OUTREACH.md, send 50 messages

## Key Files
- `STRATEGY.md` — product strategy
- `OUTREACH.md` — outreach playbook
- `landing.html` — landing page for user acquisition
- `start.sh` — one-command startup
- `.opencode/todo.md` — task tracking

## Environment
- Python 3.13, Flask-Smorest 0.47.0, marshmallow 4.3.1
- React + Vite, Recharts
- Branch: `develop` (last push: `190e557`)
