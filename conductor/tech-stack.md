# Technology Stack

## Core Technologies
- **Backend:** Python (Flask 3.0.0+) - Lightweight web framework for building the RESTful API.
- **Frontend:** React (18.2.0+) with Vite (5.0.8+) - Modern library for building dynamic, responsive user interfaces.
- **Data Processing:** Pandas (2.1.4+) - Comprehensive library for data manipulation and analysis.
- **Data Visualization:** D3.js (7.8.5+) & Matplotlib (3.8.2+) - Dynamic and static chart generation.

## Database & Persistence
- **ORM:** SQLAlchemy (2.0.23+) & Flask-SQLAlchemy (3.1.1+).
- **Migrations:** Flask-Migrate (4.0.5+).
- **Databases:**
  - **SQLite:** For development and local testing.
  - **PostgreSQL:** Recommended for production data persistence.

## Authentication & Security
- **User Management:** Flask-Login (0.6.3+) - Manage user sessions.
- **Password Hashing:** Flask-Bcrypt (1.0.1+).
- **CORS:** Flask-Cors (4.0.0+) - Enable secure cross-origin resource sharing.

## Communication & Infrastructure
- **API Client:** Axios (1.6.2+) - HTTP client for frontend communication.
- **Routing:** React Router (6.21.0+) - Frontend navigation management.
- **Server:** Gunicorn (21.2.0+) - Production WSGI server for the backend.
- **Environment Management:** python-dotenv (1.0.0+) - Manage configuration via environment variables.

## Architecture
- **Structure:** Monorepo with separate `backend/` and `frontend/` directories for modularity and ease of development.
