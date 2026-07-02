import os
import json
import pandas as pd
from datetime import datetime, timezone
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from app.models import db, User, Category, DataEntry

migrate = Migrate()
login_manager = LoginManager()
limiter = Limiter(get_remote_address)


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    limiter.init_app(app)
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

    from app.routes import auth, data, categories, analytics
    app.register_blueprint(auth.bp)
    app.register_blueprint(data.bp)
    app.register_blueprint(categories.bp)
    app.register_blueprint(analytics.bp)

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'timestamp': datetime.now(timezone.utc).isoformat()}

    with app.app_context():
        db.create_all()
        if os.environ.get('FLASK_ENV') != 'production':
            seed_demo_data()
    return app


def seed_demo_data():
    if User.query.first():
        return
    
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
        {'country': 'USA', 'region': 'North America', 'population': 331000000},
        {'country': 'India', 'region': 'Asia', 'population': 1380000000},
        {'country': 'Brazil', 'region': 'South America', 'population': 212000000},
        {'country': 'France', 'region': 'Europe', 'population': 67000000},
        {'country': 'Germany', 'region': 'Europe', 'population': 83000000},
        {'country': 'UK', 'region': 'Europe', 'population': 67000000},
        {'country': 'Italy', 'region': 'Europe', 'population': 60000000},
        {'country': 'Spain', 'region': 'Europe', 'population': 47000000},
        {'country': 'Argentina', 'region': 'South America', 'population': 45000000},
        {'country': 'Russia', 'region': 'Europe', 'population': 144000000},
        {'country': 'Mexico', 'region': 'North America', 'population': 128000000},
        {'country': 'Japan', 'region': 'Asia', 'population': 126000000},
        {'country': 'South Africa', 'region': 'Africa', 'population': 59000000},
        {'country': 'Canada', 'region': 'North America', 'population': 38000000},
        {'country': 'Australia', 'region': 'Oceania', 'population': 25000000},
        {'country': 'China', 'region': 'Asia', 'population': 1400000000},
        {'country': 'Indonesia', 'region': 'Asia', 'population': 273000000},
        {'country': 'Pakistan', 'region': 'Asia', 'population': 220000000},
        {'country': 'Nigeria', 'region': 'Africa', 'population': 206000000},
        {'country': 'Bangladesh', 'region': 'Asia', 'population': 164000000},
    ]
    
    import random
    random.seed(42)
    
    base_date = datetime(2020, 1, 1)
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
            title=f"COVID-19 Data - {country_data['country']} - {entry_date.strftime('%Y-%m-%d')}",
            date=entry_date.date(),
            country=country_data['country'],
            region=country_data['region'],
            confirmed_cases=confirmed,
            deaths=deaths,
            recovered=recovered,
            active_cases=active,
            population=country_data['population'],
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
