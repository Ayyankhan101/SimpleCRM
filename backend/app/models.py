from datetime import datetime, timezone

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Index
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


class Organization(db.Model):
    __tablename__ = 'organizations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    plan = db.Column(db.String(20), default='free')  # free/pro/enterprise
    max_users = db.Column(db.Integer, default=5)
    settings = db.Column(db.Text)  # JSON
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    users = db.relationship('User', backref='organization', lazy=True)
    contacts = db.relationship('Contact', backref='organization', lazy=True)
    deals = db.relationship('Deal', backref='organization', lazy=True)
    activities = db.relationship('Activity', backref='organization', lazy=True)
    data_entries = db.relationship('DataEntry', backref='organization', lazy=True)
    categories = db.relationship('Category', backref='organization', lazy=True)
    tags = db.relationship('Tag', backref='organization', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'plan': self.plan,
            'max_users': self.max_users,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    google_id = db.Column(db.String(120), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    role = db.Column(db.String(20), default='member')  # owner/admin/member
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    categories = db.relationship('Category', backref='user', lazy=True, cascade='all, delete-orphan')
    data_entries = db.relationship('DataEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    data_sources = db.relationship('DataSource', backref='user', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('NotificationConfig', backref='user', lazy=True, cascade='all, delete-orphan')
    contacts = db.relationship('Contact', backref='owner', lazy=True)
    deals = db.relationship('Deal', backref='owner', lazy=True)
    activities = db.relationship('Activity', backref='owner', lazy=True)
    audit_logs = db.relationship('AuditLog', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'role': self.role,
            'org_id': self.org_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Contact(db.Model):
    __tablename__ = 'contacts'
    __table_args__ = (
        Index('idx_contacts_org_owner', 'org_id', 'owner_id'),
        Index('idx_contacts_org_stage', 'org_id', 'stage'),
        Index('idx_contacts_email', 'email'),
    )

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    company = db.Column(db.String(200))
    role = db.Column(db.String(100))
    address = db.Column(db.Text)
    website = db.Column(db.String(200))
    stage = db.Column(db.String(20), default='lead')  # lead/prospect/customer/churned
    score = db.Column(db.Integer, default=0)  # 0-100
    tags = db.Column(db.Text)  # JSON array
    custom_fields = db.Column(db.Text)  # JSON object
    notes = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = db.Column(db.DateTime, nullable=True)  # soft delete

    deals = db.relationship('Deal', backref='contact', lazy=True)
    activities = db.relationship('Activity', backref='contact', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f'{self.first_name} {self.last_name}',
            'email': self.email,
            'phone': self.phone,
            'company': self.company,
            'role': self.role,
            'address': self.address,
            'website': self.website,
            'stage': self.stage,
            'score': self.score,
            'tags': self.get_tags(),
            'custom_fields': self.get_custom_fields(),
            'notes': self.notes,
            'owner_id': self.owner_id,
            'org_id': self.org_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

    def get_tags(self):
        if self.tags:
            import json
            return json.loads(self.tags)
        return []

    def set_tags(self, tag_list):
        import json
        self.tags = json.dumps(tag_list)

    def get_custom_fields(self):
        if self.custom_fields:
            import json
            return json.loads(self.custom_fields)
        return {}

    def set_custom_fields(self, fields):
        import json
        self.custom_fields = json.dumps(fields)


class Deal(db.Model):
    __tablename__ = 'deals'
    __table_args__ = (
        Index('idx_deals_org_stage', 'org_id', 'stage'),
        Index('idx_deals_org_owner', 'org_id', 'owner_id'),
        Index('idx_deals_expected_close', 'org_id', 'expected_close_date'),
        Index('idx_deals_contact', 'contact_id'),
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    value = db.Column(db.Float, default=0)
    currency = db.Column(db.String(3), default='USD')
    stage = db.Column(db.String(30), default='lead')
    # lead/qualified/proposal/negotiation/closed_won/closed_lost
    probability = db.Column(db.Integer, default=10)  # 0-100
    expected_close_date = db.Column(db.Date)
    actual_close_date = db.Column(db.Date)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    notes = db.Column(db.Text)  # JSON
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = db.Column(db.DateTime, nullable=True)

    activities = db.relationship('Activity', backref='deal', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'value': self.value,
            'currency': self.currency,
            'stage': self.stage,
            'probability': self.probability,
            'expected_close_date': self.expected_close_date.isoformat() if self.expected_close_date else None,
            'actual_close_date': self.actual_close_date.isoformat() if self.actual_close_date else None,
            'contact_id': self.contact_id,
            'contact_name': f'{self.contact.first_name} {self.contact.last_name}' if self.contact else None,
            'owner_id': self.owner_id,
            'org_id': self.org_id,
            'notes': self.get_notes(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }

    def get_notes(self):
        if self.notes:
            import json
            return json.loads(self.notes)
        return {}

    def set_notes(self, notes_dict):
        import json
        self.notes = json.dumps(notes_dict)

    @property
    def weighted_value(self):
        return self.value * (self.probability / 100)


class Activity(db.Model):
    __tablename__ = 'activities'
    __table_args__ = (
        Index('idx_activities_org_type', 'org_id', 'type'),
        Index('idx_activities_contact', 'contact_id'),
        Index('idx_activities_deal', 'deal_id'),
        Index('idx_activities_owner_due', 'owner_id', 'due_date'),
    )

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # call/email/meeting/note/task/follow_up
    subject = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text)
    outcome = db.Column(db.String(100))
    deal_id = db.Column(db.Integer, db.ForeignKey('deals.id'), nullable=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'subject': self.subject,
            'body': self.body,
            'outcome': self.outcome,
            'deal_id': self.deal_id,
            'deal_title': self.deal.title if self.deal else None,
            'contact_id': self.contact_id,
            'contact_name': f'{self.contact.first_name} {self.contact.last_name}' if self.contact else None,
            'owner_id': self.owner_id,
            'org_id': self.org_id,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed': self.completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Tag(db.Model):
    __tablename__ = 'tags'
    __table_args__ = (
        Index('idx_tags_org_name', 'org_id', 'name', unique=True),
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(7), default='#3B82F6')
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'org_id': self.org_id
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    __table_args__ = (
        Index('idx_audit_log_org_user', 'org_id', 'user_id'),
        Index('idx_audit_log_entity', 'entity_type', 'entity_id'),
        Index('idx_audit_log_created', 'created_at'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    action = db.Column(db.String(20), nullable=False)  # create/update/delete
    entity_type = db.Column(db.String(50), nullable=False)  # contact/deal/activity/etc
    entity_id = db.Column(db.Integer, nullable=False)
    changes = db.Column(db.Text)  # JSON of what changed
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'org_id': self.org_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'changes': self.get_changes(),
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def get_changes(self):
        if self.changes:
            import json
            return json.loads(self.changes)
        return {}


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
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

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
            'org_id': self.org_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class DataEntry(db.Model):
    __tablename__ = 'data_entries'
    __table_args__ = (
        Index('idx_user_id', 'user_id'),
        Index('idx_date', 'date'),
        Index('idx_data_group', 'group_name'),
        Index('idx_category_id', 'category_id'),
        Index('idx_data_org_date', 'org_id', 'date'),
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)

    # Generic grouping fields (was country/region)
    group_name = db.Column(db.String(100))
    subgroup_name = db.Column(db.String(100))

    # Generic metrics (was confirmed_cases/deaths/recovered/active_cases/population)
    metric_a = db.Column(db.Integer, default=0)
    metric_b = db.Column(db.Integer, default=0)
    metric_c = db.Column(db.Integer, default=0)
    metric_d = db.Column(db.Integer, default=0)
    metric_e = db.Column(db.Integer, default=0)

    # Metric labels (stored in values_json for flexibility)
    values_json = db.Column(db.Text)
    metrics_json = db.Column(db.Text)

    # CRM fields
    tags = db.Column(db.Text)  # JSON array
    priority = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='active')

    # Foreign keys
    source_id = db.Column(db.Integer, db.ForeignKey('data_sources.id'), nullable=True)
    source_type = db.Column(db.String(20), default='manual')
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = db.Column(db.DateTime, nullable=True)

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

    def get_tags(self):
        if self.tags:
            import json
            return json.loads(self.tags)
        return []

    def set_tags(self, tag_list):
        import json
        self.tags = json.dumps(tag_list)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'date': self.date.isoformat() if self.date else None,
            'group_name': self.group_name,
            'subgroup_name': self.subgroup_name,
            'metric_a': self.metric_a,
            'metric_b': self.metric_b,
            'metric_c': self.metric_c,
            'metric_d': self.metric_d,
            'metric_e': self.metric_e,
            'values': self.get_values(),
            'metrics': self.get_metrics(),
            'tags': self.get_tags(),
            'priority': self.priority,
            'status': self.status,
            'source_id': self.source_id,
            'source_type': self.source_type,
            'category_id': self.category_id,
            'user_id': self.user_id,
            'org_id': self.org_id,
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
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

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
