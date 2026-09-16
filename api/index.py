def app(environ, start_response):
    """Simple WSGI app for testing."""
    start_response('200 OK', [('Content-Type', 'application/json')])
    return [b'{"status": "ok"}']
