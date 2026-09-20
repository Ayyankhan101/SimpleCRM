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

    if not os.environ.get('VERCEL'):
        INSTANCE_DIR.mkdir(exist_ok=True)

    if os.environ.get('VERCEL'):
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:////tmp/simplecrm.db'
    else:
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{INSTANCE_DIR / "data_analytics.db"}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,  # handle Neon scale-to-zero reconnection
        'pool_recycle': 300,    # recycle connections every 5 min
    }

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID') or ''
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET') or ''
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI') or 'http://localhost:5000/api/auth/google/callback'

    WTF_CSRF_ENABLED = True
    CORS_HEADERS = 'Content-Type'
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    
    @classmethod
    def init_app(cls, app):
        if not os.environ.get('DATABASE_URL'):
            import warnings
            warnings.warn("DATABASE_URL not set — falling back to SQLite in /tmp")
            cls.SQLALCHEMY_DATABASE_URI = 'sqlite:///tmp/simplecrm.db'


class DevelopmentConfig(Config):
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    WTF_CSRF_ENABLED = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
