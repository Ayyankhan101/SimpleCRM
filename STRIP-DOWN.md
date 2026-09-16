# Code Strip-Down Plan

## Goal
Remove everything that doesn't serve "Simple CRM for small businesses."

## What to KEEP (Core CRM)

### Backend
| File | Status | Notes |
|------|--------|-------|
| `app/__init__.py` | KEEP + EDIT | Remove non-CRM blueprint registrations |
| `app/models.py` | KEEP + EDIT | Keep: User, Organization, Contact, Deal, Activity, AuditLog. Remove: DataEntry, DataSource, Category, NotificationConfig |
| `app/routes/auth.py` | KEEP | Auth is core |
| `app/routes/data.py` | DELETE | Not CRM |
| `app/routes/categories.py` | DELETE | Not CRM |
| `app/routes/analytics.py` | DELETE | Not CRM |
| `app/routes/sources.py` | DELETE | Not CRM |
| `app/routes/notifications.py` | DELETE | Not CRM |
| `app/routes/webhooks.py` | DELETE | Not CRM |
| `app/routes/health.py` | KEEP | Health check is useful |
| `app/api_v1/contacts.py` | KEEP | Core CRM |
| `app/api_v1/deals.py` | KEEP | Core CRM |
| `app/api_v1/activities.py` | KEEP | Core CRM |
| `app/services/rbac.py` | KEEP | Role-based access |
| `app/services/security.py` | KEEP | Input sanitization |
| `app/services/analytics.py` | DELETE | Not CRM |
| `app/services/validation.py` | DELETE | Not CRM |
| `app/services/notifications.py` | DELETE | Not CRM |

### Frontend
| File | Status | Notes |
|------|--------|-------|
| `src/App.jsx` | KEEP + EDIT | Remove non-CRM routes |
| `src/main.jsx` | KEEP | Entry point |
| `src/pages/Login.jsx` | KEEP | Auth |
| `src/pages/Register.jsx` | KEEP | Auth |
| `src/pages/Dashboard.jsx` | KEEP + EDIT | Simplify to: total deals, total contacts, tasks due today |
| `src/pages/Contacts.jsx` | KEEP | Core CRM |
| `src/pages/Deals.jsx` | KEEP | Core CRM |
| `src/pages/Activities.jsx` | KEEP | Core CRM |
| `src/pages/DataEntries.jsx` | DELETE | Not CRM |
| `src/pages/Categories.jsx` | DELETE | Not CRM |
| `src/pages/Sources.jsx` | DELETE | Not CRM |
| `src/pages/Compare.jsx` | DELETE | Not CRM |
| `src/pages/Notifications.jsx` | DELETE | Not CRM |
| `src/components/Layout.jsx` | KEEP + EDIT | Remove non-CRM nav items |
| `src/utils/api.js` | KEEP | API client |

### Infrastructure
| File | Status | Notes |
|------|--------|-------|
| `start.sh` | KEEP | Still useful |
| `docker-compose.yml` | KEEP + EDIT | Simplify (remove Celery if not needed) |
| `backend/requirements.txt` | KEEP + EDIT | Remove unused deps |
| `frontend/package.json` | KEEP | Dependencies still needed |

## What to REMOVE

### Backend Files to Delete
- `app/routes/data.py`
- `app/routes/categories.py`
- `app/routes/analytics.py`
- `app/routes/sources.py`
- `app/routes/notifications.py`
- `app/routes/webhooks.py`
- `app/services/analytics.py`
- `app/services/validation.py`
- `app/services/notifications.py`

### Frontend Files to Delete
- `src/pages/DataEntries.jsx`
- `src/pages/Categories.jsx`
- `src/pages/Sources.jsx`
- `src/pages/Compare.jsx`
- `src/pages/Notifications.jsx`

### Models to Remove from models.py
- `DataEntry`
- `DataSource`
- `Category`
- `NotificationConfig`

### Routes to Remove from __init__.py
- data_bp
- categories_bp
- analytics_bp
- sources_bp
- notifications_bp
- webhooks_bp

### Nav Items to Remove from Layout.jsx
- Data Entries
- Categories
- Sources
- Compare
- Notifications

## Dashboard Simplification

**Current:** Complex analytics with charts, trends, forecasts
**New:** 3 numbers + 1 list

```
┌─────────────────────────────────────────────┐
│  Dashboard                                  │
├─────────────┬─────────────┬─────────────────┤
│  Contacts   │  Deals      │  Tasks Due      │
│  47         │  12         │  3              │
├─────────────┴─────────────┴─────────────────┤
│  Pipeline                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐                │
│  │ Lead │ │Propo │ │Closed│                │
│  │  8   │ │  3   │ │  1   │                │
│  └──────┘ └──────┘ └──────┘                │
├─────────────────────────────────────────────┤
│  Tasks Due Today                            │
│  ☐ Follow up with John (Acme Corp)          │
│  ☐ Send proposal to Jane (Tech Co)          │
│  ☐ Call Bob about renewal                   │
└─────────────────────────────────────────────┘
```

## Contact Model Simplification

**Current:** Complex with tags, audit logs, multiple relationships
**New:** Simple fields only

```python
class Contact:
    id
    first_name
    last_name
    email
    phone
    company
    notes
    stage  # lead, prospect, customer
    owner_id  # who owns this contact
    org_id  # multi-tenant
    created_at
    updated_at
```

## Deal Model Simplification

**Current:** Complex with tags, audit logs, multiple relationships
**New:** Simple pipeline

```python
class Deal:
    id
    title
    value  # dollar amount
    stage  # lead, proposal, closed_won, closed_lost
    contact_id  # linked contact
    owner_id
    org_id
    created_at
    updated_at
```

## Activity Model (Keep As-Is)

```python
class Activity:
    id
    type  # call, email, meeting, task
    subject
    description
    due_date
    contact_id
    deal_id
    owner_id
    org_id
    created_at
    updated_at
```

## Navigation Simplification

**Current:**
- Dashboard
- Data Entries
- Categories
- Contacts
- Deals
- Activities
- Sources
- Compare
- Notifications

**New:**
- Dashboard
- Contacts
- Deals
- Activities
- Settings (future)

## Implementation Order

1. **Delete backend files** (data, categories, analytics, sources, notifications, webhooks routes)
2. **Delete frontend files** (DataEntries, Categories, Sources, Compare, Notifications pages)
3. **Edit models.py** (remove DataEntry, DataSource, Category, NotificationConfig)
4. **Edit __init__.py** (remove non-CRM blueprint registrations)
5. **Edit Layout.jsx** (remove non-CRM nav items)
6. **Edit App.jsx** (remove non-CRM routes)
7. **Simplify Dashboard.jsx** (3 numbers + pipeline + tasks)
8. **Update requirements.txt** (remove unused deps)
9. **Test everything works**
10. **Update README**

## Estimated Effort

- Delete files: 10 min
- Edit models: 15 min
- Edit routes/init: 15 min
- Simplify Dashboard: 30 min
- Edit nav/layout: 15 min
- Test: 20 min
- Total: ~2 hours
