import os
from datetime import timedelta
from pathlib import Path


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is required")

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY environment variable is required")

    BASE_DIR = Path(__file__).parent
    INSTANCE_DIR = BASE_DIR / 'instance'
    INSTANCE_DIR.mkdir(exist_ok=True)
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{INSTANCE_DIR / "data_analytics.db"}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID') or ''
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET') or ''
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI') or 'http://localhost:5000/api/auth/google/callback'

    WTF_CSRF_ENABLED = True
    CORS_HEADERS = 'Content-Type'


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    
    @classmethod
    def init_app(cls, app):
        if not os.environ.get('DATABASE_URL'):
            raise ValueError("DATABASE_URL environment variable is required in production")


class DevelopmentConfig(Config):
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    WTF_CSRF_ENABLED = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
