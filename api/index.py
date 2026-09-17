import os
import sys

# Add the api directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables BEFORE importing app
os.environ.setdefault('SECRET_KEY', os.environ.get('SECRET_KEY', 'vercel-dev-secret-key-change-in-production'))
os.environ.setdefault('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'vercel-dev-jwt-secret-key-change-in-production'))
os.environ.setdefault('FLASK_ENV', 'production')

from app import create_app

flask_app = create_app()


def app(environ, start_response):
    """WSGI handler for Vercel."""
    return flask_app(environ, start_response)
