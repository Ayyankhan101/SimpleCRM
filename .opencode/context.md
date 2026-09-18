# Project Context

## Current Status
**SimpleCRM — Full audit pass complete. 12 backend+frontend fixes deployed. Testing loop in progress.**

### Latest Deploy
- Commit `26b740e` pushed to `develop`, deployed from project root to Vercel
- **Production:** `https://frontend-navy-psi-33.vercel.app`
- **GitHub:** `https://github.com/Ayyankhan101/SimpleCRM`

### Completed This Session (Audit Pass)
**Backend fixes (6):**
1. PUT endpoints whitelist fields — prevent `owner_id`/`org_id` overwrite (contacts.py, deals.py, activities.py)
2. Activity `completed_at` resets to None on uncomplete (activities.py:62-66)
3. Contact search filter — server-side `?search=` on first_name, last_name, email, company (contacts.py:19-34)
4. Activity `to_dict()` crash-safe on deleted deal/contact (models.py:246-255)
5. Removed 'churned' from allowed stages, added `OneOf` activity type validation (schemas/__init__.py)
6. New `/v1/stats` endpoint — counts + pipeline + upcoming_activities, no full-record fetch (api_v1/__init__.py)

**Frontend fixes (6):**
7. `isRedirecting` → `lastRedirect` timestamp with 2s cooldown (api.js:11-28)
8. 404 catch-all route in App.jsx
9. ContactDetail shows "Contact not found" + back link instead of blank page (ContactDetail.jsx:96-103)
10. Delete failures show error alert on all pages (Contacts, ContactDetail, Deals, Activities)
11. Dashboard uses `/v1/stats` endpoint (1 API call vs 3) (Dashboard.jsx:52-70)
12. `formatRelativeDate` uses `Math.round`, `Deal.value` rounded to 2 decimals (constants.js:53, models.py:187)

### Playwright Test Results (latest run)
- 10/11 PASS, 1 SKIP (dark mode — selector issue, not app bug)
- Login ✓, Dashboard ✓, Contacts ✓, Search ✓, Stage filter ✓, Deals ✓, Pipeline ✓, Activities ✓, 404 ✓, Deep link ✓

### Backend (unchanged)
- Models: User, Organization, Contact, Deal, Activity, Tag, AuditLog
- Login: `demo@example.com` / `demo123`
- Python 3.13, Flask-Smorest 0.47.0, marshmallow 4.3.1

## Bugs Found in Testing Loop (Round 2)
### App Bugs
1. **ACTIVITY_TYPES missing `follow_up`** — backend allows it, frontend constants.js doesn't define it → broken badge
2. **Input component has no `name` attr** — all forms untargetable by Playwright `input[name=...]`

### Test Script Bugs (not app bugs)
3. **Contact create fills search bar** — `input[type="text"]` fallback picks search bar → cascading failures
4. **Session expires mid-test** — dark mode SKIP because page redirected to /login

## Pending Tasks
- [ ] Add `follow_up` to ACTIVITY_TYPES in constants.js
- [ ] Add `name` prop to Input.jsx component
- [ ] Add `name` attrs to all form inputs (Contacts, Deals, Activities, ContactDetail)
- [ ] Rewrite Playwright test with proper selectors (`input[name=...]`)
- [ ] Build, deploy, retest loop until 0 failures
- [ ] Set up Vercel Postgres (manual dashboard)
- [ ] Claim Netlify landing page

## Key Files
- `api/app/__init__.py` — CORS config, seed, stats blueprint
- `api/app/api_v1/contacts.py` — PUT whitelist, search filter
- `api/app/api_v1/deals.py` — PUT whitelist
- `api/app/api_v1/activities.py` — PUT whitelist, completed_at reset
- `api/app/schemas/__init__.py` — validation rules
- `api/app/models.py` — Deal.notes fix, Contact.full_name fix, Activity.to_dict safe
- `frontend/src/utils/api.js` — 401 cooldown redirect
- `frontend/src/components/ui/Input.jsx` — needs `name` prop
- `frontend/src/pages/Contacts.jsx` — contact CRUD + search
- `frontend/src/pages/Deals.jsx` — deal CRUD
- `frontend/src/pages/Activities.jsx` — activity CRUD + toggle
- `frontend/src/pages/ContactDetail.jsx` — detail + edit modal
- `frontend/src/pages/Dashboard.jsx` — uses /v1/stats
- `frontend/src/lib/constants.js` — missing follow_up type
- `frontend/src/pages/Pipeline.jsx` — kanban drag-and-drop

## Environment
- Branch: `develop`
- Caveman mode: full
- Vercel linked project: `frontend` (org: `ayyankhan101s-projects`)
- `FRONTEND_URL=https://frontend-navy-psi-33.vercel.app` in Vercel prod env
- Deploy must run from project root (`/Users/mac/projects/Data-Analysis-App`)
- Git commits: `26b740e` (audit pass), `4e25a11` (earlier fixes)
