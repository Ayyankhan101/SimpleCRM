import os
import sys

# Add the api directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Ensure critical secrets are set (Config.py will raise ValueError if missing)
if not os.environ.get('SECRET_KEY'):
    raise RuntimeError("SECRET_KEY environment variable is required")
if not os.environ.get('JWT_SECRET_KEY'):
    raise RuntimeError("JWT_SECRET_KEY environment variable is required")
os.environ.setdefault('FLASK_ENV', 'production')

from app import create_app

flask_app = create_app()


def app(environ, start_response):
    """WSGI handler for Vercel."""
    return flask_app(environ, start_response)
