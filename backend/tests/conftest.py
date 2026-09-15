import os

import pytest

os.environ['SECRET_KEY'] = 'test-secret-key-for-testing'
os.environ['JWT_SECRET_KEY'] = 'test-jwt-secret-key-for-testing'
os.environ['FLASK_ENV'] = 'testing'

from app import create_app, limiter
from app.models import db as _db
from config import TestingConfig


@pytest.fixture(scope='session')
def app():
    app = create_app(config_class=TestingConfig)
    app.config['TESTING'] = True
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
        'password': 'Password123',
        'username': 'testuser'
    })
    from app.models import User, Organization, db as _db
    user = User.query.filter_by(email='test@example.com').first()
    user.role = 'member'
    org = Organization(name='Test Org', slug='test-org')
    _db.session.add(org)
    _db.session.flush()
    user.org_id = org.id
    _db.session.commit()
    return client
