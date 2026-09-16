import os
from datetime import datetime, timezone

from config import Config
from flask import Flask, jsonify
from flask_caching import Cache
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_smorest import Api
from flask_wtf.csrf import CSRFProtect

from app.models import User, db

migrate = Migrate()
login_manager = LoginManager()
limiter = Limiter(
    get_remote_address,
    default_limits=["200 per minute", "50 per second"],
    storage_uri="memory://"
)
csrf = CSRFProtect()
cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 30})
api = Api()


def create_app(config_class=Config):
    app = Flask(__name__)

    if os.environ.get('VERCEL'):
        app.instance_path = '/tmp'

    app.config.from_object(config_class)
    app.config['API_TITLE'] = 'SimpleCRM API'
    app.config['API_VERSION'] = 'v1'
    app.config['OPENAPI_VERSION'] = '3.0.3'
    app.config['OPENAPI_URL_PREFIX'] = '/api/docs'
    app.config['OPENAPI_SWAGGER_UI_URL'] = '/swagger-ui'
    app.config['OPENAPI_SWAGGER_UI_VERSION'] = '5.17.14'

    db.init_app(app)
    api.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    csrf.init_app(app)
    cache.init_app(app)
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    CORS(app,
         origins=[frontend_url, "http://localhost:5173", "http://localhost:3000"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type"],
         max_age=600)

    login_manager.login_view = 'auth.login'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    from app.routes import auth, health
    app.register_blueprint(auth.bp)
    app.register_blueprint(health.bp)

    from app.api_v1.contacts import contacts_blp
    from app.api_v1.deals import deals_blp
    from app.api_v1.activities import activities_blp
    api.register_blueprint(contacts_blp)
    api.register_blueprint(deals_blp)
    api.register_blueprint(activities_blp)

    # Exempt ALL API blueprints from CSRF — REST API uses SameSite cookies
    for bp_obj in [auth.bp, health.bp, contacts_blp, deals_blp, activities_blp]:
        csrf.exempt(bp_obj)

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    with app.app_context():
        db.create_all()
        seed_demo_data()

    if os.environ.get('ENFORCE_HTTPS', '').lower() == 'true':
        from app.services.security import enforce_https
        enforce_https(app)

    return app


def seed_demo_data():
    try:
        if User.query.first():
            return
    except Exception:
        return

    try:
        print("Seeding demo data...")

        from app.models import Organization
        org = Organization(name='Demo Company', slug='demo-company', plan='free')
        db.session.add(org)
        db.session.flush()

        user = User(email='demo@example.com', username='demo', org_id=org.id)
        user.set_password('demo123')
        db.session.add(user)
        db.session.flush()

        # Create demo contacts
        from app.models import Contact
        contacts_data = [
            {'first_name': 'John', 'last_name': 'Doe', 'email': 'john@example.com', 'company': 'Acme Corp', 'stage': 'lead'},
            {'first_name': 'Jane', 'last_name': 'Smith', 'email': 'jane@example.com', 'company': 'Tech Co', 'stage': 'prospect'},
            {'first_name': 'Bob', 'last_name': 'Wilson', 'email': 'bob@example.com', 'company': 'Design Studio', 'stage': 'customer'},
        ]

        for c_data in contacts_data:
            contact = Contact(**c_data, owner_id=user.id, org_id=org.id)
            db.session.add(contact)

        db.session.flush()

        # Create demo deals
        from app.models import Deal
        contacts = Contact.query.filter_by(owner_id=user.id).all()
        deals_data = [
            {'title': 'Website Redesign', 'value': 15000, 'stage': 'proposal', 'contact_id': contacts[0].id},
            {'title': 'Mobile App', 'value': 25000, 'stage': 'lead', 'contact_id': contacts[1].id},
            {'title': 'Brand Identity', 'value': 8000, 'stage': 'closed_won', 'contact_id': contacts[2].id},
        ]

        for d_data in deals_data:
            deal = Deal(**d_data, owner_id=user.id, org_id=org.id)
            db.session.add(deal)

        # Create demo activities
        from app.models import Activity
        activities_data = [
            {'type': 'call', 'subject': 'Follow up with John', 'due_date': datetime.now(timezone.utc)},
            {'type': 'email', 'subject': 'Send proposal to Jane', 'due_date': datetime.now(timezone.utc)},
            {'type': 'meeting', 'subject': 'Kickoff with Bob', 'completed': True, 'completed_at': datetime.now(timezone.utc)},
        ]

        for a_data in activities_data:
            activity = Activity(**a_data, owner_id=user.id, org_id=org.id)
            db.session.add(activity)

        db.session.commit()
        print("Seeded demo data: 3 contacts, 3 deals, 3 activities")
    except Exception as e:
        print(f"Seed error: {e}")
        db.session.rollback()
