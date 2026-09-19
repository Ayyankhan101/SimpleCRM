from flask_smorest import Blueprint
from flask import jsonify
from flask_login import login_required, current_user
from app.models import Contact, Deal, Activity, db
from sqlalchemy import func
from datetime import datetime

from datetime import datetime, timedelta

contacts_blp = Blueprint('contacts', 'Contacts', url_prefix='/api/v1/contacts', description='Contact management')
deals_blp = Blueprint('deals', 'Deals', url_prefix='/api/v1/deals', description='Deal pipeline')
activities_blp = Blueprint('activities', 'Activities', url_prefix='/api/v1/activities', description='Activity tracking')
stats_blp = Blueprint('stats', 'Stats', url_prefix='/api/v1/stats', description='Dashboard statistics')


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
def get_stats():
    """Get dashboard statistics without fetching all records."""
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

    overdue, due_today, upcoming = _get_activity_lists(current_user.id, limit=5)

    return jsonify({
        'contacts': contact_count,
        'deals': deal_count,
        'activities': activity_count,
        'pipeline': pipeline,
        'overdue_activities': [a.to_dict() for a in overdue],
        'due_today_activities': [a.to_dict() for a in due_today],
        'upcoming_activities': [a.to_dict() for a in upcoming],
    })
