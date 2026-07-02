import pytest
import os
os.environ['SECRET_KEY'] = 'test-secret-key-for-testing'
os.environ['FLASK_ENV'] = 'testing'

from app import create_app
from app.models import db as _db
from app import limiter


@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    limiter.enabled = False
    return app


@pytest.fixture(scope='function')
def db(app):
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.rollback()
        _db.drop_all()


@pytest.fixture
def client(app, db):
    return app.test_client()


@pytest.fixture
def auth_client(client, db):
    """Client with authenticated user via session cookie."""
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'password123',
        'username': 'testuser'
    })
    return client
