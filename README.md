# SimpleCRM

Stop paying for features you'll never use.

A simple CRM for small businesses. Contacts, deals, tasks — that's it. Built with Flask (backend) and React (frontend).

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
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
- **Activities** — Log calls, emails, meetings; set due dates
- **Dashboard** — Stat cards, pipeline chart, upcoming tasks
- **Auth** — Register/login, Google OAuth, role-based access (owner/admin/member)
- **Multi-tenant** — Organization support with plans (free/pro/enterprise)
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
| GET | `/api/v1/contacts/` | List contacts (filter by stage) |
| POST | `/api/v1/contacts/` | Create contact |
| PUT | `/api/v1/contacts/<id>` | Update contact |
| DELETE | `/api/v1/contacts/<id>` | Soft-delete contact |

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
| GET | `/api/v1/activities/` | List activities (filter by type) |
| POST | `/api/v1/activities/` | Create activity |
| PUT | `/api/v1/activities/<id>` | Update activity |
| DELETE | `/api/v1/activities/<id>` | Soft-delete activity |

## Project Structure

```
SimpleCRM/
├── start.sh                 # One-command startup
├── api/                     # Backend (Flask)
│   ├── app/
│   │   ├── __init__.py      # App factory + seed data
│   │   ├── models.py        # User, Contact, Deal, Activity
│   │   ├── schemas.py       # Marshmallow serialization
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
│   │   │   ├── Layout.jsx   # Sidebar nav
│   │   │   ├── Modal.jsx    # Reusable modal
│   │   │   └── ui/          # Button, Input, Badge
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── lib/
│   │   │   └── constants.js # Stages, colors, formatters
│   │   └── utils/api.js     # Axios config
│   ├── vercel.json
│   └── package.json
├── vercel.json               # Root deploy config
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

**Backend tests:**
```bash
cd api
source venv/bin/activate
pytest tests/ -v
```

## Deployment

### Vercel
- Root `vercel.json` handles both API and frontend
- SPA routing configured for client-side navigation
- API routes proxy to Python serverless functions

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
cd api && rm -f simplecrm.db && cd .. && ./start.sh
```

**Frontend build fails:**
```bash
cd frontend && rm -rf node_modules && npm install
```

## License

Private and proprietary.

---

*Last updated: September 2026*
