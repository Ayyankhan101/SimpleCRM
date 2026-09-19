# SimpleCRM

Stop paying for features you'll never use.

A simple CRM for small businesses. Contacts, deals, activities — that's it. Built with Flask + React.

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-private-red.svg)

**Live:** https://frontend-navy-psi-33.vercel.app

## Quick Start

```bash
git clone https://github.com/Ayyankhan101/SimpleCRM.git
cd SimpleCRM
./start.sh
```

Open **http://localhost:5173**, register a new account, start adding contacts.

**Other modes:**
```bash
./start.sh --docker   # PostgreSQL stack
./start.sh --test     # Run tests
./start.sh --help     # Show all options
```

## Features

- **Contacts** — Track leads, prospects, customers with stages, scores, notes
- **Deals** — Pipeline view with stages, values, probability tracking
- **Pipeline** — Kanban drag-and-drop board for deal management
- **Activities** — Log calls, emails, meetings, tasks, follow-ups with due dates
- **Dashboard** — Stat cards, pipeline chart, overdue/due today/upcoming activity sections
- **CSV Import** — Preview and bulk import contacts from CSV files
- **Activity Reminders** — Email digest for overdue and due-today activities (Resend)
- **Auth** — Register/login, Google OAuth, role-based access (owner/admin/member)
- **Multi-tenant** — Organization support with plans (free/pro/enterprise)
- **Dark Mode** — Toggle between light, dark, and system themes
- **Stage Filters** — Filter contacts/deals by pipeline stage
- **Search** — Find contacts by name/email/company
- **Responsive** — Works on desktop and mobile

## Pricing

| Plan | Users | Contacts | Price |
|------|-------|----------|-------|
| Free | 1 | 100 | $0/mo |
| Pro | 3 | Unlimited | $10/mo |
| Business | 10 | Unlimited | $25/mo |

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.13 | Programming language |
| Flask 3.0 | Web framework |
| SQLAlchemy 2.0 | Database ORM |
| Flask-Smorest 0.47 | REST API |
| Marshmallow 4.3 | Serialization |
| Flask-Login | Session management |
| Flask-Limiter | Rate limiting |
| Neon Postgres | Production database (serverless) |
| Resend | Transactional email (reminders, digests) |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite 5 | Build tool |
| React Router 6 | Routing |
| Axios | HTTP client |
| Recharts | Data visualization |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Phosphor Icons | Icon library |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contacts/` | List contacts (filter by stage, search) |
| POST | `/api/v1/contacts/` | Create contact |
| PUT | `/api/v1/contacts/<id>` | Update contact |
| DELETE | `/api/v1/contacts/<id>` | Soft-delete contact |
| POST | `/api/v1/contacts/import/preview` | Preview CSV import |
| POST | `/api/v1/contacts/import` | Import contacts from CSV |

### Deals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/deals/` | List deals (filter by stage) |
| POST | `/api/v1/deals/` | Create deal |
| PUT | `/api/v1/deals/<id>` | Update deal |
| DELETE | `/api/v1/deals/<id>` | Soft-delete deal |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/activities/` | List activities (filter by type, due date) |
| POST | `/api/v1/activities/` | Create activity |
| PUT | `/api/v1/activities/<id>` | Update activity (including completion toggle) |
| DELETE | `/api/v1/activities/<id>` | Soft-delete activity |

### Dashboard & Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stats` | Dashboard statistics (counts, pipeline, activity lists) |
| GET | `/api/v1/reminders/check` | Check overdue/due-today counts |
| POST | `/api/v1/reminders/digest` | Send email digest of pending activities |

## Project Structure

```
SimpleCRM/
├── start.sh                 # One-command startup
├── api/                     # Backend (Flask)
│   ├── app/
│   │   ├── __init__.py      # App factory + seed data + stats endpoint
│   │   ├── models.py        # User, Organization, Contact, Deal, Activity, AuditLog
│   │   ├── schemas/         # Marshmallow serialization
│   │   ├── routes/
│   │   │   ├── auth.py      # Authentication + Google OAuth
│   │   │   └── health.py    # Health check
│   │   ├── api_v1/
│   │   │   ├── __init__.py  # Blueprint definitions + shared activity helpers
│   │   │   ├── contacts.py  # Contact CRUD + search + stage filter
│   │   │   ├── deals.py     # Deal CRUD + stage filter
│   │   │   ├── activities.py # Activity CRUD + due date filter
│   │   │   ├── import_contacts.py # CSV preview + import
│   │   │   └── reminders.py # Activity reminder check + email digest
│   │   └── services/
│   │       ├── email.py     # Resend email service
│   │       ├── rbac.py      # Role-based access
│   │       └── security.py  # Input sanitization
│   ├── config.py            # Config with Neon Postgres + Resend
│   ├── index.py             # Vercel WSGI entry point
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Routes + OAuth callback
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Contacts.jsx
│   │   │   ├── ContactDetail.jsx
│   │   │   ├── Deals.jsx
│   │   │   ├── Pipeline.jsx
│   │   │   ├── Activities.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx   # Sidebar nav + theme toggle
│   │   │   ├── ContactPicker.jsx
│   │   │   ├── DealPicker.jsx
│   │   │   ├── ImportPreview.jsx
│   │   │   └── ui/          # Button, Input, Badge, Modal, Skeleton
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── lib/
│   │   │   └── constants.js # Stages, colors, formatters
│   │   └── utils/
│   │       └── api.js       # Axios config
│   ├── vercel.json
│   └── package.json
├── vercel.json               # Root deploy config
└── README.md
```

## Configuration

### Environment Variables

**Required:**
```bash
SECRET_KEY=<random-key>
JWT_SECRET_KEY=<random-key>
DATABASE_URL=postgresql://user:pass@host:port/db
FRONTEND_URL=https://your-domain.com
```

**Optional (email reminders):**
```bash
RESEND_API_KEY=re_...
FROM_EMAIL=onboarding@resend.dev    # test mode
RESEND_TEST_MODE=true               # set false for production
```

**Optional (Google OAuth):**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Production (Vercel)

Set environment variables in Vercel dashboard:
```bash
npx vercel env add SECRET_KEY production
npx vercel env add JWT_SECRET_KEY production
npx vercel env add DATABASE_URL production
npx vercel env add FRONTEND_URL production
```

## Database

### Neon Postgres (Production)
```bash
# Install Neon CLI
npm i -g neon@latest

# Login
neon login

# Get connection string
neon connection-string --project-id <your-project-id>
```

Set `DATABASE_URL` in Vercel with the Neon connection string (includes `?sslmode=require`).

### SQLite (Development)
Falls back to SQLite automatically if `DATABASE_URL` is not set.

## Testing

```bash
./start.sh --test
```

**QA test suite (51 tests):**
```bash
python /tmp/test_full_qa5.py
```

**Regression test suite (25 tests):**
```bash
python /tmp/test_final2.py
```

**Total: 76/76 tests covering:**
- Login/logout/register flows
- Contact CRUD + search + stage filters
- Deal CRUD + pipeline stages
- Activity CRUD + completion toggle + due date filters
- CSV import preview + import
- Dark mode persistence
- 404 page + deep linking
- Sidebar navigation + mobile responsive

## Deployment

### Vercel
- Root `vercel.json` handles both API and frontend
- SPA routing configured for client-side navigation
- API routes proxy to Python serverless functions
- **Deploy from project root:** `npx vercel --prod --yes`

### Production Variables
```bash
SECRET_KEY=<random-key>
JWT_SECRET_KEY=<random-key>
DATABASE_URL=postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require
FRONTEND_URL=https://frontend-navy-psi-33.vercel.app
RESEND_API_KEY=re_...
FROM_EMAIL=onboarding@resend.dev
RESEND_TEST_MODE=true
```

## Troubleshooting

**Port in use:**
```bash
lsof -i :5000  # or :5173
kill <pid>
```

**Reset database:**
```bash
cd api && rm -f simplecrm.db && cd .. && ./start.sh
```

**Frontend build fails:**
```bash
cd frontend && rm -rf node_modules && npm install
```

**Vercel deploy fails:**
```bash
# Re-authenticate
npx vercel login

# Deploy from project root (not frontend/)
npx vercel --prod --yes
```

## License

Private and proprietary.

---

*Last updated: September 2026*
