import os
import sys
from io import BytesIO

# Add the api directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables BEFORE importing app
os.environ.setdefault('SECRET_KEY', os.environ.get('SECRET_KEY', 'vercel-dev-secret-key-change-in-production'))
os.environ.setdefault('JWT_SECRET_KEY', os.environ.get('JWT_SECRET_KEY', 'vercel-dev-jwt-secret-key-change-in-production'))
os.environ.setdefault('FLASK_ENV', 'production')

from app import create_app

app = create_app()

def handler(request):
    """Vercel Python serverless function handler."""
    environ = {
        'REQUEST_METHOD': request.get('method', 'GET'),
        'SCRIPT_NAME': '',
        'PATH_INFO': request.get('path', '/'),
        'QUERY_STRING': request.get('query', ''),
        'SERVER_NAME': 'vercel',
        'SERVER_PORT': '443',
        'SERVER_PROTOCOL': 'HTTP/1.1',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.input': BytesIO(request.get('body', '').encode() if isinstance(request.get('body', ''), str) else request.get('body', b'')),
        'wsgi.errors': BytesIO(),
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
    }

    headers = request.get('headers', {})
    for key, value in headers.items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            key = 'HTTP_' + key
        environ[key] = value

    response_started = []
    response_body = []
    response_status = []
    response_headers = []

    def start_response(status, headers_list, exc_info=None):
        response_status.append(status)
        response_headers.extend(headers_list)
        return response_body.append

    body_iter = app(environ, start_response)
    for chunk in body_iter:
        response_body.append(chunk)

    status_code = int(response_status[0].split(' ')[0]) if response_status else 200
    headers_dict = {k: v for k, v in response_headers}

    return {
        'statusCode': status_code,
        'headers': headers_dict,
        'body': b''.join(response_body).decode('utf-8', errors='replace')
    }
