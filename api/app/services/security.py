import bleach
from flask import redirect, request


ALLOWED_TAGS = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span']
ALLOWED_ATTRS = {'a': ['href', 'title']}


def sanitize_html(text):
    if not text:
        return text
    return bleach.clean(text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)


def sanitize_string(value):
    if not isinstance(value, str):
        return value
    return sanitize_html(value.strip())


def sanitize_dict(data):
    if not isinstance(data, dict):
        return data
    return {k: sanitize_string(v) if isinstance(v, str) else v for k, v in data.items()}


def enforce_https(app):
    @app.before_request
    def redirect_http():
        if request.is_secure:
            return
        if request.headers.get('X-Forwarded-Proto') == 'https':
            return
        if request.environ.get('HTTP_X_FORWARDED_PROTO') == 'https':
            return
        url = request.url.replace('http://', 'https://', 1)
        return redirect(url, code=301)
