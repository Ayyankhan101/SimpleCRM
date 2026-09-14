import json
import os
from datetime import datetime, timezone

import pandas as pd
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

from app.models import Category, DataEntry, User, db
from app.models import DataSource as DataSource
from app.models import NotificationConfig as NotificationConfig

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
    app.config.from_object(config_class)
    app.config['API_TITLE'] = 'CRM Data Analytics API'
    app.config['API_VERSION'] = 'v1'
    app.config['OPENAPI_VERSION'] = '3.0.3'
    app.config['OPENAPI_URL_PREFIX'] = '/api/docs'
    app.config['OPENAPI_SWAGGER_UI_URL'] = '/swagger-ui'
    app.config['OPENAPI_SWAGGER_UI_VERSION'] = '5.17.14'

    db.init_app(app)
    api.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    limiter.init_app(app)
    csrf.init_app(app)
    cache.init_app(app)
    CORS(app,
         origins=["http://localhost:5173", "http://localhost:3000"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type"],
         max_age=600)

    login_manager.login_view = 'auth.login'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    from app.routes import (
        analytics,
        auth,
        categories,
        data,
        health,
        notifications,
        sources,
        webhooks,
    )
    app.register_blueprint(auth.bp)
    app.register_blueprint(data.bp)
    app.register_blueprint(categories.bp)
    app.register_blueprint(analytics.bp)
    app.register_blueprint(sources.bp)
    app.register_blueprint(webhooks.bp)
    app.register_blueprint(notifications.bp)
    app.register_blueprint(health.bp)

    from app.api_v1.contacts import contacts_blp
    from app.api_v1.deals import deals_blp
    from app.api_v1.activities import activities_blp
    api.register_blueprint(contacts_blp)
    api.register_blueprint(deals_blp)
    api.register_blueprint(activities_blp)

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
        if os.environ.get('FLASK_ENV') not in ('testing', 'production'):
            seed_demo_data()
    return app


def seed_demo_data():
    try:
        if User.query.first():
            return
    except Exception:
        return

    try:
        print("Seeding demo data...")

        user = User(email='demo@example.com', username='demo')
        user.set_password('demo123')
        db.session.add(user)
        db.session.flush()

        categories_data = [
            {'name': 'COVID-19', 'description': 'COVID-19 pandemic data', 'color': '#EF4444', 'icon': 'virus'},
            {'name': 'Healthcare', 'description': 'Healthcare statistics', 'color': '#10B981', 'icon': 'heart'},
            {'name': 'Economy', 'description': 'Economic indicators', 'color': '#F59E0B', 'icon': 'chart-line'},
            {'name': 'Demographics', 'description': 'Population demographics', 'color': '#8B5CF6', 'icon': 'users'},
        ]

        for cat_data in categories_data:
            category = Category(**cat_data, user_id=user.id)
            db.session.add(category)

        db.session.flush()

        covid_category = Category.query.filter_by(name='COVID-19', user_id=user.id).first()

        countries = [
            {'group_name': 'USA', 'subgroup_name': 'North America', 'metric_e': 331000000},
            {'group_name': 'India', 'subgroup_name': 'Asia', 'metric_e': 1380000000},
            {'group_name': 'Brazil', 'subgroup_name': 'South America', 'metric_e': 212000000},
            {'group_name': 'France', 'subgroup_name': 'Europe', 'metric_e': 67000000},
            {'group_name': 'Germany', 'subgroup_name': 'Europe', 'metric_e': 83000000},
            {'group_name': 'UK', 'subgroup_name': 'Europe', 'metric_e': 67000000},
            {'group_name': 'Italy', 'subgroup_name': 'Europe', 'metric_e': 60000000},
            {'group_name': 'Spain', 'subgroup_name': 'Europe', 'metric_e': 47000000},
            {'group_name': 'Argentina', 'subgroup_name': 'South America', 'metric_e': 45000000},
            {'group_name': 'Russia', 'subgroup_name': 'Europe', 'metric_e': 144000000},
            {'group_name': 'Mexico', 'subgroup_name': 'North America', 'metric_e': 128000000},
            {'group_name': 'Japan', 'subgroup_name': 'Asia', 'metric_e': 126000000},
            {'group_name': 'South Africa', 'subgroup_name': 'Africa', 'metric_e': 59000000},
            {'group_name': 'Canada', 'subgroup_name': 'North America', 'metric_e': 38000000},
            {'group_name': 'Australia', 'subgroup_name': 'Oceania', 'metric_e': 25000000},
            {'group_name': 'China', 'subgroup_name': 'Asia', 'metric_e': 1400000000},
            {'group_name': 'Indonesia', 'subgroup_name': 'Asia', 'metric_e': 273000000},
            {'group_name': 'Pakistan', 'subgroup_name': 'Asia', 'metric_e': 220000000},
            {'group_name': 'Nigeria', 'subgroup_name': 'Africa', 'metric_e': 206000000},
            {'group_name': 'Bangladesh', 'subgroup_name': 'Asia', 'metric_e': 164000000},
        ]

        import random
        random.seed(42)

        base_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
        entries = []

        for i in range(500):
            country_data = random.choice(countries)
            days_offset = random.randint(0, 730)
            entry_date = base_date + pd.Timedelta(days=days_offset)

            confirmed = random.randint(100, 5000000) if days_offset > 60 else random.randint(10, 1000)
            deaths = int(confirmed * random.uniform(0.01, 0.05))
            recovered = int(confirmed * random.uniform(0.6, 0.9))
            active = confirmed - deaths - recovered

            entry = DataEntry(
                title=f"COVID-19 Data - {country_data['group_name']} - {entry_date.strftime('%Y-%m-%d')}",
                date=entry_date.date(),
                group_name=country_data['group_name'],
                subgroup_name=country_data['subgroup_name'],
                metric_a=confirmed,
                metric_b=deaths,
                metric_c=recovered,
                metric_d=active,
                metric_e=country_data['metric_e'],
                category_id=covid_category.id,
                user_id=user.id,
                values_json=json.dumps({
                    'tests': random.randint(1000, 10000000),
                    'hospitalizations': random.randint(10, 50000),
                    'icu_admissions': random.randint(1, 5000)
                })
            )
            entries.append(entry)

        db.session.add_all(entries)
        db.session.commit()
        print(f"Seeded {len(entries)} demo data entries!")
    except Exception:
        db.session.rollback()
