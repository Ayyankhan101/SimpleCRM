import os
import sys

# Add the api directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables BEFORE importing app
os.environ.setdefault('SECRET_KEY', os.environ.get('SECRET_KEY', 'vercel-dev-secret-key-change-in-production'))
os.environ.setdefault('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'vercel-dev-jwt-secret-key-change-in-production'))
os.environ.setdefault('FLASK_ENV', 'production')

from app import create_app

app = create_app()

# Vercel serverless function - WSGI handler
def handler(request, response):
    return app(request.environ, response.start_response)
