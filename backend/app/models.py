from datetime import datetime, timezone

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    google_id = db.Column(db.String(120), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    categories = db.relationship('Category', backref='user', lazy=True, cascade='all, delete-orphan')
    data_entries = db.relationship('DataEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    data_sources = db.relationship('DataSource', backref='user', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('NotificationConfig', backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default='#3B82F6')
    icon = db.Column(db.String(50), default='folder')
    template = db.Column(db.String(50), default='custom')
    field_schema = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    data_entries = db.relationship('DataEntry', backref=db.backref('category', lazy='joined'), lazy=True)
    
    def get_field_schema(self):
        if self.field_schema:
            import json
            return json.loads(self.field_schema)
        return []
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'template': self.template,
            'field_schema': self.get_field_schema(),
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class DataEntry(db.Model):
    __tablename__ = 'data_entries'
    __table_args__ = (
        db.Index('idx_user_id', 'user_id'),
        db.Index('idx_date', 'date'),
        db.Index('idx_country', 'country'),
        db.Index('idx_category_id', 'category_id'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)
    country = db.Column(db.String(100))
    region = db.Column(db.String(100))
    confirmed_cases = db.Column(db.Integer, default=0)
    deaths = db.Column(db.Integer, default=0)
    recovered = db.Column(db.Integer, default=0)
    active_cases = db.Column(db.Integer, default=0)
    population = db.Column(db.Integer, default=0)
    values_json = db.Column(db.Text)
    metrics_json = db.Column(db.Text)
    source_id = db.Column(db.Integer, db.ForeignKey('data_sources.id'), nullable=True)
    source_type = db.Column(db.String(20), default='manual')
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def get_values(self):
        if self.values_json:
            import json
            return json.loads(self.values_json)
        return {}
    
    def get_metrics(self):
        if self.metrics_json:
            import json
            return json.loads(self.metrics_json)
        return {}
    
    def set_metrics(self, metrics: dict):
        import json
        self.metrics_json = json.dumps(metrics)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'date': self.date.isoformat() if self.date else None,
            'country': self.country,
            'region': self.region,
            'confirmed_cases': self.confirmed_cases,
            'deaths': self.deaths,
            'recovered': self.recovered,
            'active_cases': self.active_cases,
            'population': self.population,
            'values': self.get_values(),
            'metrics': self.get_metrics(),
            'source_id': self.source_id,
            'source_type': self.source_type,
            'category_id': self.category_id,
            'user_id': self.user_id,
            'category': self.category.to_dict() if self.category else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class DataSource(db.Model):
    __tablename__ = 'data_sources'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    source_type = db.Column(db.String(20), nullable=False)
    config_json = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')
    last_sync_at = db.Column(db.DateTime)
    sync_error = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    entries = db.relationship('DataEntry', backref='source', lazy=True)
    
    def get_config(self):
        if self.config_json:
            import json
            return json.loads(self.config_json)
        return {}
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'source_type': self.source_type,
            'config': self.get_config(),
            'status': self.status,
            'last_sync_at': self.last_sync_at.isoformat() if self.last_sync_at else None,
            'sync_error': self.sync_error,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class NotificationConfig(db.Model):
    __tablename__ = 'notification_configs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    notify_type = db.Column(db.String(20), nullable=False)
    config_json = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    last_sent_at = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def get_config(self):
        if self.config_json:
            import json
            return json.loads(self.config_json)
        return {}
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'notify_type': self.notify_type,
            'config': self.get_config(),
            'is_active': self.is_active,
            'last_sent_at': self.last_sent_at.isoformat() if self.last_sent_at else None,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
