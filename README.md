# Data Analysis App

A full-stack web application for data analytics and visualization, built with Flask (backend) and React (frontend). This platform enables users to manage, analyze, and visualize data through interactive dashboards and comprehensive analytics tools.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-private-red.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Demo Data](#demo-data)
- [Deployment](#deployment)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Backend Features
- **User Authentication**: Secure user registration and login with Flask-Login, session cookies, CSRF protection
- **RESTful API**: Well-structured API endpoints for data operations
- **Database Management**: SQLAlchemy ORM with SQLite/PostgreSQL support
- **Data Analytics**: Pandas-powered analysis with growth rates, moving averages, forecasts
- **Data Validation**: CSV import validation with row-level error reporting
- **Webhook Integration**: Receive data via HMAC-signed webhooks
- **Notifications**: Email (SendGrid) and webhook notifications on data updates
- **Data Sources**: Manage API, CSV, and webhook data sources with sync status
- **Database Migrations**: Flask-Migrate for schema version control
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Rate Limiting**: Flask-Limiter for API abuse prevention
- **Caching**: Flask-Caching for performance optimization

### Frontend Features
- **Modern UI**: React 18 with Vite for fast development and builds
- **Routing**: React Router for seamless navigation
- **Data Visualization**: Recharts for interactive charts (area, bar, pie, line)
- **Dashboard**: KPI cards, date range selector, trend analysis
- **Data Sources**: Manage API, CSV, and webhook sources
- **Country Comparison**: Compare up to 4 countries with line chart overlay
- **Notifications**: Configure email and webhook alerts
- **CSV Import**: Preview validation before importing
- **Responsive Design**: Mobile-friendly interface
- **Component Architecture**: Modular and reusable components

### Core Functionality
- **Dashboard**: Interactive charts with date range filtering (7/30/90/180 days)
- **Data Management**: CRUD operations with pagination, search, bulk delete
- **Categories**: Organize data into customizable categories
- **Analytics**: Growth rates, moving averages, trend forecasts, anomaly detection
- **Multi-region Support**: Track data by country and region
- **Data Sources**: API, CSV, webhook sources with sync and status tracking

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.x | Programming language |
| Flask | 3.0.0 | Web framework |
| SQLAlchemy | 2.0.23 | Database ORM |
| Flask-SQLAlchemy | 3.1.1 | Flask SQLAlchemy integration |
| Flask-Migrate | 4.0.5 | Database migrations |
| Flask-Cors | 4.0.0 | CORS support |
| Flask-Login | 0.6.3 | User session management |
| Flask-Bcrypt | 1.0.1 | Password hashing |
| Flask-Limiter | 3.5.0 | Rate limiting |
| Flask-Caching | 2.1.0 | Response caching |
| Flask-WTF | 1.2.1 | CSRF protection |
| Pandas | 2.1.4 | Data analysis |
| Gunicorn | 21.2.0 | Production WSGI server |
| psycopg2-binary | 2.9.9 | PostgreSQL adapter |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library |
| Vite | 5.0.8 | Build tool |
| React Router | 6.21.0 | Routing |
| Axios | 1.6.2 | HTTP client |
| Recharts | 2.10.0 | Data visualization |

---

## 📦 Prerequisites

Before installation, ensure you have the following:

- **Python 3.8+** installed
- **Node.js 18+** and **npm** installed
- **Git** for version control
- **PostgreSQL** (optional, for production; SQLite works for development)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Data-Analysis-App
```

### 2. Install Backend Dependencies

```bash
cd backend
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Install Root Dependencies

```bash
cd ..
npm install
```

---

## ⚙️ Configuration

### Environment Variables

Copy the example environment file and configure:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Application secret key (required, change in production)
SECRET_KEY=your-secret-key-change-in-production

# JWT secret key (required, separate from SECRET_KEY)
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# Database configuration
DATABASE_URL=sqlite:///data_analytics.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## ▶️ Running the Application

### Development Mode

**Option 1: Run both backend and frontend concurrently**

```bash
# From the root directory
npm run dev
```

**Option 2: Run separately**

```bash
# Terminal 1 - Backend
cd backend
python run.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### Demo Credentials

The application seeds demo data on first run:

- **Email**: demo@example.com
- **Username**: demo
- **Password**: demo123

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/google/callback` | Google OAuth callback |

#### Data Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | Get all data entries (paginated) |
| GET | `/api/data/<id>` | Get specific entry |
| POST | `/api/data` | Create new entry |
| PUT | `/api/data/<id>` | Update entry |
| DELETE | `/api/data/<id>` | Delete entry |
| POST | `/api/data/bulk-delete` | Bulk delete entries |
| POST | `/api/data/import` | Import CSV |
| POST | `/api/data/import/preview` | Preview CSV import (validation) |
| GET | `/api/data/export` | Export CSV |

#### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/<id>` | Get specific category |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/<id>` | Update category |
| DELETE | `/api/categories/<id>` | Delete category |

#### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Get analytics summary |
| GET | `/api/analytics/trends` | Get trend data |
| GET | `/api/analytics/category-breakdown` | Category breakdown |
| GET | `/api/analytics/date-range` | Data date range |
| GET | `/api/analytics/growth-rate` | Growth rate calculation |
| GET | `/api/analytics/forecast` | Trend forecast (linear regression) |
| GET | `/api/analytics/moving-average` | Moving average |
| GET | `/api/analytics/anomalies` | Anomaly detection |

#### Data Sources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sources` | List data sources |
| POST | `/api/sources` | Create data source |
| PUT | `/api/sources/<id>` | Update data source |
| DELETE | `/api/sources/<id>` | Delete data source |
| POST | `/api/sources/<id>/sync` | Sync data source |

#### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications` | Create notification |
| PUT | `/api/notifications/<id>` | Update notification |
| DELETE | `/api/notifications/<id>` | Delete notification |
| POST | `/api/notifications/<id>/test` | Test notification |

#### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/<source_id>` | Receive webhook data |
| GET | `/api/webhooks/<source_id>/recent` | Recent webhook entries |

### Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 📁 Project Structure

```
Data-Analysis-App/
├── backend/                    # Flask backend application
│   ├── app/
│   │   ├── __init__.py        # App factory & initialization
│   │   ├── models.py          # Database models (User, Category, DataEntry, DataSource, NotificationConfig)
│   │   ├── routes/
│   │   │   ├── auth.py        # Authentication routes
│   │   │   ├── data.py        # Data entry routes (CRUD, import, export)
│   │   │   ├── categories.py  # Category routes
│   │   │   ├── analytics.py   # Analytics routes (summary, trends, growth, forecast)
│   │   │   ├── sources.py     # Data source routes (CRUD, sync)
│   │   │   ├── webhooks.py    # Webhook receive routes
│   │   │   └── notifications.py # Notification routes (CRUD, test)
│   │   ├── services/
│   │   │   ├── analytics.py   # Growth rate, forecast, moving average, anomaly detection
│   │   │   ├── validation.py  # CSV validation, duplicate detection
│   │   │   └── notifications.py # Email (SendGrid) + webhook notifications
│   │   └── tests/
│   │       ├── test_auth.py
│   │       ├── test_data.py
│   │       ├── test_categories.py
│   │       ├── test_analytics.py
│   │       ├── test_sources.py
│   │       ├── test_webhooks.py
│   │       ├── test_notifications.py
│   │       └── test_validation.py
│   ├── config.py              # Configuration classes
│   ├── run.py                 # Application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── .env.example           # Environment template
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── App.jsx            # Main application component with routes
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Global styles
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Sidebar layout with navigation
│   │   │   └── ImportPreview.jsx # CSV import preview
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Dashboard with Recharts (area, bar, pie)
│   │   │   ├── DataEntries.jsx # Data management with pagination
│   │   │   ├── Categories.jsx # Categories management
│   │   │   ├── Sources.jsx    # Data source management
│   │   │   ├── Compare.jsx    # Country comparison charts
│   │   │   ├── Notifications.jsx # Notification configuration
│   │   │   ├── Login.jsx      # Login page
│   │   │   └── Register.jsx   # Registration page
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/
│   │       └── api.js         # Axios instance
│   ├── public/                # Static assets
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Node dependencies
│
├── package.json               # Root package.json (concurrent runs)
└── README.md                  # Project documentation
```

---

## 📊 Demo Data

The application automatically seeds demo data on first run:

### Demo Categories
- **COVID-19**: Pandemic tracking data
- **Healthcare**: Healthcare statistics
- **Economy**: Economic indicators
- **Demographics**: Population data

### Sample Data
- 500+ COVID-19 data entries
- 20 countries across all regions
- Date range: January 2020 - December 2021
- Metrics: confirmed cases, deaths, recoveries, active cases

---

## 🧪 Testing

### Backend Tests (64 tests)

```bash
cd backend
SECRET_KEY=test JWT_SECRET_KEY=test pytest tests/ -v
```

Tests cover:
- Authentication (register, login, logout, password complexity)
- Data CRUD, bulk delete, CSV import/export
- Categories CRUD with cascade
- Analytics (summary, trends, growth rate, forecast, anomalies)
- Data sources CRUD, sync, webhook receive
- Notifications CRUD, email/webhook send
- CSV validation, duplicate detection

### Frontend Tests (59 tests)

```bash
cd frontend
npm test
```

Tests cover:
- Login/Register forms with validation
- Dashboard rendering
- Data entries CRUD
- Categories management

### Lint

```bash
ruff check backend/
```

---

## 🚢 Deployment

### Backend Deployment

#### Using Gunicorn (Production)

```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

#### Platform-Specific

**Render**
- Configuration in `render.yaml`
- Procfile included for deployment

**Heroku**
- Procfile included
- Set environment variables in dashboard

### Frontend Deployment

#### Build for Production

```bash
cd frontend
npm run build
```

#### Vercel
- Configuration in `vercel.json`
- Deploy with Vercel CLI or Git integration

### Environment Variables for Production

Ensure these are set in your production environment:

```bash
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
FRONTEND_URL=https://your-domain.com
```

---

## 👨‍💻 Development

### Running Tests

**Backend tests:**
```bash
cd backend
SECRET_KEY=test JWT_SECRET_KEY=test pytest tests/ -v

# With coverage
SECRET_KEY=test JWT_SECRET_KEY=test pytest tests/ -v --cov=app --cov-report=html
```

**Frontend tests:**
```bash
cd frontend
npm test
```

### Code Style

**Backend linting:**
```bash
pip install ruff
ruff check backend/
ruff format backend/
```

### Database Migrations

```bash
# Create a new migration
cd backend
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migrations
flask db downgrade
```

### Docker

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

### Environment Variables

Required for production:
```bash
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>
DATABASE_URL=postgresql://user:password@host:port/database
FLASK_ENV=production
FRONTEND_URL=https://your-domain.com
```

---

## 🔧 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check if virtual environment is activated
# Verify dependencies are installed
pip install -r requirements.txt

# Check if port 5000 is in use
lsof -i :5000
```

**Frontend build fails**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Database errors**
```bash
# Reset the database (development only)
cd backend
rm instance/data_analytics.db
python run.py
```

**CORS errors**
- Ensure `FRONTEND_URL` is set correctly in backend `.env`
- Verify CORS is enabled in `app/__init__.py`

---

## 📄 License

This project is private and proprietary.

---

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Contact the development team

---

*Last updated: September 2026*
