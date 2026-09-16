import os
import sys
from io import BytesIO

# Add the api directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables BEFORE importing app
os.environ.setdefault('SECRET_KEY', os.environ.get('SECRET_KEY', 'vercel-dev-secret-key-change-in-production'))
os.environ.setdefault('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'vercel-dev-jwt-secret-key-change-in-production'))
os.environ.setdefault('FLASK_ENV', 'production')

try:
    from app import create_app
    flask_app = create_app()
except Exception as e:
    import traceback
    flask_app = None
    _error = traceback.format_exc()


def app(environ, start_response):
    """WSGI handler for Vercel."""
    if flask_app is None:
        start_response('500 Internal Server Error', [('Content-Type', 'application/json')])
        return [b'{"error": "Failed to import app"}']
    return flask_app(environ, start_response)
