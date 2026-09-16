# SimpleCRM

Stop paying for features you'll never use.

A simple CRM for small businesses. Contacts, deals, tasks — that's it. Built with Flask (backend) and React (frontend).

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-private-red.svg)

## Quick Start

```bash
git clone <repository-url>
cd Data-Analysis-App
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
- **Activities** — Log calls, emails, meetings; set due dates
- **Dashboard** — 3 stat cards, pipeline chart, upcoming tasks
- **Auth** — Register/login, Google OAuth, role-based access (owner/admin/member)
- **Multi-tenant** — Organization support with plans (free/pro/enterprise)
- **Audit Log** — Track all create/update/delete actions
- **Rate Limiting** — 200 req/min, 50 req/sec
- **CSRF Protection** — Secure cookie-based auth

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

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite 5 | Build tool |
| React Router 6 | Routing |
| Axios | HTTP client |
| Recharts | Data visualization |

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
| GET | `/api/contacts` | List contacts (paginated) |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts/<id>` | Get contact |
| PUT | `/api/contacts/<id>` | Update contact |
| DELETE | `/api/contacts/<id>` | Delete contact |

### Deals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deals` | List deals (paginated) |
| POST | `/api/deals` | Create deal |
| GET | `/api/deals/<id>` | Get deal |
| PUT | `/api/deals/<id>` | Update deal |
| DELETE | `/api/deals/<id>` | Delete deal |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | List activities (paginated) |
| POST | `/api/activities` | Create activity |
| GET | `/api/activities/<id>` | Get activity |
| PUT | `/api/activities/<id>` | Update activity |
| DELETE | `/api/activities/<id>` | Delete activity |

## Project Structure

```
Data-Analysis-App/
├── start.sh                 # One-command startup
├── backend/
│   ├── app/
│   │   ├── __init__.py      # App factory
│   │   ├── models.py        # User, Contact, Deal, Activity, Tag, AuditLog
│   │   ├── routes/
│   │   │   ├── auth.py      # Authentication
│   │   │   └── health.py    # Health check
│   │   ├── api_v1/
│   │   │   ├── contacts.py  # Contact CRUD
│   │   │   ├── deals.py     # Deal CRUD
│   │   │   └── activities.py # Activity CRUD
│   │   └── services/
│   │       ├── security.py  # Input sanitization
│   │       └── rbac.py      # Role-based access
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Routes
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Contacts.jsx
│   │   │   ├── Deals.jsx
│   │   │   ├── Activities.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx   # Sidebar nav
│   │   └── utils/api.js     # Axios config
│   └── package.json
└── README.md
```

## Configuration

### Environment Variables

Backend creates `backend/.env` automatically. For production:

```bash
SECRET_KEY=<random-key>
JWT_SECRET_KEY=<random-key>
DATABASE_URL=sqlite:///simplecrm.db
FRONTEND_URL=http://localhost:5173
```

### Docker

```bash
./start.sh --docker
```

## Testing

```bash
./start.sh --test
```

**Backend tests (54 tests):**
```bash
cd backend
source venv/bin/activate
pytest tests/test_auth.py tests/test_crm.py -v
```

**E2E tests:**
```bash
cd backend
source venv/bin/activate
pytest e2e_test.py -v
```

## Deployment

### Render
- Configuration in `render.yaml`

### Vercel
- Configuration in `vercel.json`

### Production Variables
```bash
SECRET_KEY=<random-key>
JWT_SECRET_KEY=<random-key>
DATABASE_URL=postgresql://user:pass@host:port/db
FRONTEND_URL=https://your-domain.com
```

## Troubleshooting

**Port in use:**
```bash
lsof -i :5000  # or :5173
kill <pid>
```

**Reset database:**
```bash
cd backend && rm -f simplecrm.db && cd .. && ./start.sh
```

**Frontend build fails:**
```bash
cd frontend && rm -rf node_modules && npm install
```

## License

Private and proprietary.

---

*Last updated: September 2026*
