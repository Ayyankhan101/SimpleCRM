# Contributing to SimpleCRM

Thanks for your interest in contributing! Here's how to get started.

## Prerequisites

- Python 3.13+
- Node.js 20+
- PostgreSQL (or SQLite for local dev)

## Setup

```bash
git clone https://github.com/Ayyankhan101/SimpleCRM.git
cd SimpleCRM
./start.sh
```

This starts both the Flask backend (port 5000) and Vite frontend (port 5173).

## Project Structure

```
SimpleCRM/
├── api/                    # Flask backend
│   ├── app/
│   │   ├── api_v1/        # API endpoints (contacts, deals, activities)
│   │   ├── routes/        # Auth routes
│   │   ├── services/      # Email, security
│   │   ├── models.py      # SQLAlchemy models
│   │   └── __init__.py    # App factory
│   ├── config.py          # Configuration
│   └── requirements.txt   # Python deps
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── pages/         # Route components
│   │   ├── components/    # Reusable UI
│   │   ├── context/       # Auth, Theme providers
│   │   └── lib/           # Constants, API client
│   └── package.json
└── start.sh               # One-command startup
```

## Development

### Backend

```bash
cd api
pip install -r requirements.txt
python index.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
./start.sh --test
```

## API

API docs available at `/api/docs/openapi.json` when running locally.

### Key Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/register` | No | Register |
| GET | `/api/v1/contacts/` | Yes | List contacts |
| POST | `/api/v1/contacts/` | Yes | Create contact |
| GET | `/api/v1/deals/` | Yes | List deals |
| GET | `/api/v1/activities/` | Yes | List activities |
| GET | `/api/v1/stats` | Yes | Dashboard stats |

## Code Style

- **Python:** PEP 8, type hints encouraged
- **JavaScript:** ESLint defaults, functional components
- **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)

## Pull Requests

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push to your fork
5. Open a PR against `develop`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Flask secret key |
| `JWT_SECRET_KEY` | Yes | JWT signing key |
| `DATABASE_URL` | Prod | Postgres connection string |
| `RESEND_API_KEY` | Optional | Email service API key |
| `FRONTEND_URL` | Prod | Frontend URL for CORS |

## License

Private — not open for redistribution.
