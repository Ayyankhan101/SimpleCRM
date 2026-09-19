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
_rate_limit_store = os.environ.get('DATABASE_URL', 'memory://')
limiter = Limiter(
    get_remote_address,
    default_limits=["200 per minute", "50 per second"],
    storage_uri=_rate_limit_store
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
    vercel_url = os.environ.get('VERCEL_URL', '')
    allowed_origins = [frontend_url, "http://localhost:5173", "http://localhost:3000"]
    if vercel_url:
        allowed_origins.append(f"https://{vercel_url}")
    CORS(app,
         origins=allowed_origins,
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type", "Set-Cookie"],
         max_age=600)

    login_manager.login_view = 'auth.login'

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({'error': 'Unauthorized'}), 401

    @login_manager.user_loader
    def load_user(user_id):
        try:
            return User.query.get(int(user_id))
        except (ValueError, TypeError):
            return None

    from app.routes import auth, health
    app.register_blueprint(auth.bp)
    app.register_blueprint(health.bp)

    from app.api_v1.contacts import contacts_blp
    from app.api_v1.deals import deals_blp
    from app.api_v1.activities import activities_blp
    from app.api_v1 import stats_blp
    from app.api_v1.reminders import reminders_blp
    from app.api_v1.emails import emails_blp
    from app.api_v1.webhooks import webhooks_blp
    from app.api_v1 import import_contacts  # noqa: F401 — registers routes on contacts_blp
    api.register_blueprint(contacts_blp)
    api.register_blueprint(deals_blp)
    api.register_blueprint(activities_blp)
    api.register_blueprint(stats_blp)
    api.register_blueprint(reminders_blp)
    api.register_blueprint(emails_blp)
    api.register_blueprint(webhooks_blp)

    # Exempt ALL API blueprints from CSRF — REST API uses SameSite cookies
    for bp_obj in [auth.bp, health.bp, contacts_blp, deals_blp, activities_blp, stats_blp, reminders_blp, emails_blp, webhooks_blp]:
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
        fix_bad_data()

    if os.environ.get('ENFORCE_HTTPS', '').lower() == 'true':
        from app.services.security import enforce_https
        enforce_https(app)

    return app


def seed_demo_data():
    try:
        if User.query.first():
            # Ensure demo activities with due dates exist
            _ensure_activity_due_dates()
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
            {'first_name': 'Bob', 'last_name': 'Wilson', 'email': 'bob@example.com', 'company': 'Design Studio', 'stage': 'closed_won'},
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

        # Create demo activities with realistic due dates
        from app.models import Activity
        from datetime import timedelta
        now = datetime.utcnow()
        activities_data = [
            {'type': 'call', 'subject': 'Follow up with John about contract', 'due_date': now - timedelta(days=2)},
            {'type': 'email', 'subject': 'Send proposal to Jane', 'due_date': now - timedelta(hours=3)},
            {'type': 'meeting', 'subject': 'Kickoff with Bob', 'completed': True, 'completed_at': now},
            {'type': 'task', 'subject': 'Prepare Q4 report', 'due_date': now.replace(hour=17, minute=0, second=0, microsecond=0)},
            {'type': 'follow_up', 'subject': 'Check in with Acme Corp', 'due_date': now + timedelta(days=3)},
            {'type': 'call', 'subject': 'Demo call with Tech Co', 'due_date': now + timedelta(days=7)},
        ]

        for a_data in activities_data:
            activity = Activity(**a_data, owner_id=user.id, org_id=org.id)
            db.session.add(activity)

        db.session.commit()
        print("Seeded demo data: 3 contacts, 3 deals, 6 activities")
    except Exception as e:
        print(f"Seed error: {e}")
        db.session.rollback()


def _ensure_activity_due_dates():
    """Add demo activities with due dates if user has none."""
    from app.models import Activity
    from datetime import timedelta
    user = User.query.first()
    if not user:
        return
    has_due = Activity.query.filter(
        Activity.owner_id == user.id,
        Activity.due_date.isnot(None),
        Activity.deleted_at.is_(None),
    ).first()
    if has_due:
        return
    now = datetime.utcnow()
    demo_activities = [
        Activity(type='call', subject='Follow up with John about contract', due_date=now - timedelta(days=2), owner_id=user.id, org_id=user.org_id),
        Activity(type='email', subject='Send proposal to Jane', due_date=now - timedelta(hours=3), owner_id=user.id, org_id=user.org_id),
        Activity(type='task', subject='Prepare Q4 report', due_date=now.replace(hour=17, minute=0, second=0, microsecond=0), owner_id=user.id, org_id=user.org_id),
        Activity(type='follow_up', subject='Check in with Acme Corp', due_date=now + timedelta(days=3), owner_id=user.id, org_id=user.org_id),
        Activity(type='call', subject='Demo call with Tech Co', due_date=now + timedelta(days=7), owner_id=user.id, org_id=user.org_id),
    ]
    db.session.add_all(demo_activities)
    db.session.commit()
    print("Added 5 demo activities with due dates")


def fix_bad_data():
    """Fix known bad data from earlier seed versions."""
    try:
        from app.models import Contact, Deal
        stage_map = {
            'customer': 'closed_won', 'churned': 'closed_lost',
            'won': 'closed_won', 'lost': 'closed_lost',
        }
        fixed = 0
        for model in [Contact, Deal]:
            for bad, good in stage_map.items():
                items = model.query.filter_by(stage=bad).all()
                for item in items:
                    item.stage = good
                    fixed += 1
        if fixed:
            db.session.commit()
            print(f"Fixed {fixed} records with invalid stages")
    except Exception:
        db.session.rollback()
