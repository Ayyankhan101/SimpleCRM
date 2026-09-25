import time
from collections import defaultdict

from flask_smorest import Blueprint
from flask import jsonify
from flask_login import login_required, current_user
from app import limiter
from app.models import Contact, Deal, Activity, db
from sqlalchemy import func
from datetime import datetime, timedelta

contacts_blp = Blueprint('contacts', 'Contacts', url_prefix='/api/v1/contacts', description='Contact management')
deals_blp = Blueprint('deals', 'Deals', url_prefix='/api/v1/deals', description='Deal pipeline')
activities_blp = Blueprint('activities', 'Activities', url_prefix='/api/v1/activities', description='Activity tracking')
stats_blp = Blueprint('stats', 'Stats', url_prefix='/api/v1/stats', description='Dashboard statistics')


class TTLCache:
    def __init__(self, ttl=15):
        self._store = {}
        self._ttl = ttl

    def get(self, key):
        if key in self._store:
            value, ts = self._store[key]
            if time.time() - ts < self._ttl:
                return value
            del self._store[key]
        return None

    def set(self, key, value):
        self._store[key] = (value, time.time())

    def invalidate(self, key=None):
        if key:
            self._store.pop(key, None)
        else:
            self._store.clear()


_stats_cache = TTLCache(ttl=15)


def _activity_base_filter(user_id):
    return [
        Activity.owner_id == user_id,
        Activity.deleted_at.is_(None),
        Activity.completed == False,
        Activity.due_date.isnot(None),
    ]


def _get_activity_counts(user_id):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + timedelta(days=1)
    base = _activity_base_filter(user_id)
    overdue = Activity.query.filter(*base, Activity.due_date < today_start).count()
    due_today = Activity.query.filter(*base, Activity.due_date >= today_start, Activity.due_date < tomorrow_start).count()
    upcoming = Activity.query.filter(*base, Activity.due_date >= tomorrow_start).count()
    return overdue, due_today, upcoming


def _get_activity_lists(user_id, limit=5):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + timedelta(days=1)
    base = _activity_base_filter(user_id)
    overdue = Activity.query.filter(*base, Activity.due_date < today_start).order_by(Activity.due_date.asc()).limit(limit).all()
    due_today = Activity.query.filter(*base, Activity.due_date >= today_start, Activity.due_date < tomorrow_start).order_by(Activity.due_date.asc()).limit(limit).all()
    upcoming = Activity.query.filter(*base, Activity.due_date >= tomorrow_start).order_by(Activity.due_date.asc()).limit(limit).all()
    return overdue, due_today, upcoming


@stats_blp.route('', methods=['GET'])
@login_required
@limiter.limit("30 per minute")
def get_stats():
    """Get dashboard statistics without fetching all records."""
    cache_key = f'stats:{current_user.id}'
    cached = _stats_cache.get(cache_key)
    if cached:
        return jsonify(cached)
    owner_filter = Contact.owner_id == current_user.id
    contact_count = db.session.query(func.count(Contact.id)).filter(owner_filter, Contact.deleted_at.is_(None)).scalar() or 0
    deal_count = db.session.query(func.count(Deal.id)).filter(Deal.owner_id == current_user.id, Deal.deleted_at.is_(None)).scalar() or 0
    activity_count = db.session.query(func.count(Activity.id)).filter(Activity.owner_id == current_user.id, Activity.deleted_at.is_(None)).scalar() or 0

    pipeline_rows = (
        db.session.query(Deal.stage, func.count(Deal.id))
        .filter(Deal.owner_id == current_user.id, Deal.deleted_at.is_(None))
        .group_by(Deal.stage)
        .all()
    )
    pipeline = [{'stage': row[0], 'count': row[1]} for row in pipeline_rows]

    # Revenue trend: closed_won deals grouped by month
    # Use Python-side grouping for SQLite compatibility (date_trunc is PostgreSQL-only)
    closed_deals = (
        db.session.query(Deal.actual_close_date, Deal.value)
        .filter(
            Deal.owner_id == current_user.id,
            Deal.stage == 'closed_won',
            Deal.deleted_at.is_(None),
            Deal.actual_close_date.isnot(None),
        )
        .all()
    )
    monthly_revenue = defaultdict(float)
    for close_date, value in closed_deals:
        month_key = close_date.strftime('%b %Y')
        monthly_revenue[month_key] += float(value or 0)
    revenue_trend = [
        {'month': month, 'value': round(total, 2)}
        for month, total in sorted(monthly_revenue.items(), key=lambda x: x[0])
    ]

    # Email engagement
    email_total = db.session.query(func.count(Activity.id)).filter(
        Activity.owner_id == current_user.id,
        Activity.type == 'email',
        Activity.deleted_at.is_(None),
    ).scalar() or 0
    email_opened = db.session.query(func.count(Activity.id)).filter(
        Activity.owner_id == current_user.id,
        Activity.type == 'email',
        Activity.email_opened_at.isnot(None),
    ).scalar() or 0
    email_clicked = db.session.query(func.count(Activity.id)).filter(
        Activity.owner_id == current_user.id,
        Activity.type == 'email',
        Activity.email_clicked_at.isnot(None),
    ).scalar() or 0
    email_engagement = {'total': email_total, 'opened': email_opened, 'clicked': email_clicked}

    # Activity breakdown by type
    activity_rows = (
        db.session.query(Activity.type, func.count(Activity.id))
        .filter(Activity.owner_id == current_user.id, Activity.deleted_at.is_(None))
        .group_by(Activity.type)
        .all()
    )
    activity_breakdown = [{'type': row[0], 'count': row[1]} for row in activity_rows]

    overdue, due_today, upcoming = _get_activity_lists(current_user.id, limit=5)

    result = {
        'contacts': contact_count,
        'deals': deal_count,
        'activities': activity_count,
        'pipeline': pipeline,
        'revenue_trend': revenue_trend,
        'email_engagement': email_engagement,
        'activity_breakdown': activity_breakdown,
        'overdue_activities': [a.to_dict() for a in overdue],
        'due_today_activities': [a.to_dict() for a in due_today],
        'upcoming_activities': [a.to_dict() for a in upcoming],
    }
    _stats_cache.set(cache_key, result)
    return jsonify(result)
