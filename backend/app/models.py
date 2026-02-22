from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    google_id = db.Column(db.String(120), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    categories = db.relationship('Category', backref='user', lazy=True, cascade='all, delete-orphan')
    data_entries = db.relationship('DataEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def set_password(self, password):
        from flask_bcrypt import Bcrypt
        bcrypt = Bcrypt()
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        from flask_bcrypt import Bcrypt
        bcrypt = Bcrypt()
        return bcrypt.check_password_hash(self.password_hash, password)


class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default='#3B82F6')
    icon = db.Column(db.String(50), default='folder')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    data_entries = db.relationship('DataEntry', backref='category', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class DataEntry(db.Model):
    __tablename__ = 'data_entries'
    
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
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_values(self):
        if self.values_json:
            import json
            return json.loads(self.values_json)
        return {}
    
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
            'category_id': self.category_id,
            'user_id': self.user_id,
            'category': self.category.to_dict() if self.category else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
