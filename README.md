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
- **User Authentication**: Secure user registration and login system with Flask-Login
- **RESTful API**: Well-structured API endpoints for data operations
- **Database Management**: SQLAlchemy ORM with PostgreSQL/SQLite support
- **Data Analytics**: Pandas-powered data processing and analysis
- **Data Visualization**: Matplotlib integration for chart generation
- **Database Migrations**: Flask-Migrate for schema version control
- **CORS Support**: Cross-origin resource sharing for frontend integration

### Frontend Features
- **Modern UI**: React 18 with Vite for fast development and builds
- **Routing**: React Router for seamless navigation
- **HTTP Client**: Axios for API communication
- **Data Visualization**: D3.js for interactive charts and graphs
- **Responsive Design**: Mobile-friendly interface
- **Component Architecture**: Modular and reusable components

### Core Functionality
- **Dashboard**: Overview of analytics and key metrics
- **Data Management**: CRUD operations for data entries
- **Categories**: Organize data into customizable categories
- **Analytics**: Advanced data analysis and reporting
- **Multi-region Support**: Track data by country and region

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
| Pandas | 2.1.4 | Data analysis |
| Matplotlib | 3.8.2 | Data visualization |
| Gunicorn | 21.2.0 | Production WSGI server |
| psycopg2-binary | 2.9.9 | PostgreSQL adapter |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library |
| Vite | 5.0.8 | Build tool |
| React Router | 6.21.0 | Routing |
| Axios | 1.6.2 | HTTP client |
| D3.js | 7.8.5 | Data visualization |

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
# Application secret key (change in production)
SECRET_KEY=your-secret-key-change-in-production

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
| GET | `/api/data` | Get all data entries |
| GET | `/api/data/<id>` | Get specific entry |
| POST | `/api/data` | Create new entry |
| PUT | `/api/data/<id>` | Update entry |
| DELETE | `/api/data/<id>` | Delete entry |

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
| GET | `/api/analytics/comparison` | Compare data sets |

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
│   │   ├── models.py          # Database models
│   │   ├── routes/
│   │   │   ├── auth.py        # Authentication routes
│   │   │   ├── data.py        # Data entry routes
│   │   │   ├── categories.py  # Category routes
│   │   │   └── analytics.py   # Analytics routes
│   │   ├── models/            # Additional models
│   │   ├── services/          # Business logic services
│   │   └── utils/             # Utility functions
│   ├── config.py              # Configuration classes
│   ├── run.py                 # Application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── .env.example           # Environment template
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Global styles
│   │   ├── components/
│   │   │   └── Layout.jsx     # Layout component
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Dashboard page
│   │   │   ├── DataEntries.jsx # Data management page
│   │   │   ├── Categories.jsx # Categories page
│   │   │   ├── Login.jsx      # Login page
│   │   │   └── Register.jsx   # Registration page
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
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
SECRET_KEY=test-secret pytest tests/ -v

# With coverage
SECRET_KEY=test-secret pytest tests/ -v --cov=app --cov-report=html
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

*Last updated: February 2026*
