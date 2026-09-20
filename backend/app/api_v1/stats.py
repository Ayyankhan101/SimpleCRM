from datetime import datetime, timedelta

from flask import jsonify
from flask_login import current_user, login_required
from sqlalchemy import func

from app.models import Contact, Deal, Activity, db
from app.api_v1 import stats_blp


@stats_blp.route('/', methods=['GET'])
@login_required
def get_stats():
    """Get dashboard stats."""
    uid = current_user.id
    oid = current_user.org_id

    contacts = Contact.query.filter_by(owner_id=uid, deleted_at=None).count()
    deals = Deal.query.filter_by(owner_id=uid, deleted_at=None).count()
    activities = Activity.query.filter_by(owner_id=uid, deleted_at=None).count()

    # Pipeline breakdown
    pipeline_rows = db.session.query(
        Deal.stage, func.count(Deal.id), func.coalesce(func.sum(Deal.value), 0)
    ).filter_by(owner_id=uid, deleted_at=None).group_by(Deal.stage).all()
    pipeline = [{'stage': s, 'count': c, 'value': float(v)} for s, c, v in pipeline_rows]

    # Revenue trend (last 6 months)
    now = datetime.utcnow()
    revenue_trend = []
    for i in range(5, -1, -1):
        month_start = (now - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        rev = db.session.query(func.coalesce(func.sum(Deal.value), 0)).filter(
            Deal.owner_id == uid,
            Deal.deleted_at == None,
            Deal.stage == 'closed_won',
            Deal.actual_close_date >= month_start,
            Deal.actual_close_date < month_end,
        ).scalar()
        revenue_trend.append({'month': month_start.strftime('%b'), 'revenue': float(rev)})

    # Email engagement
    email_total = Activity.query.filter_by(owner_id=uid, type='email', deleted_at=None).count()
    email_opened = 0
    email_clicked = 0

    # Activity breakdown
    activity_rows = db.session.query(
        Activity.type, func.count(Activity.id)
    ).filter_by(owner_id=uid, deleted_at=None).group_by(Activity.type).all()
    activity_breakdown = [{'type': t, 'count': c} for t, c in activity_rows]

    # Overdue / due today / upcoming
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)

    overdue = Activity.query.filter(
        Activity.owner_id == uid, Activity.due_date < today, Activity.completed == False, Activity.deleted_at == None
    ).order_by(Activity.due_date.asc()).limit(10).all()

    due_today = Activity.query.filter(
        Activity.owner_id == uid, Activity.due_date >= today, Activity.due_date < tomorrow,
        Activity.completed == False, Activity.deleted_at == None
    ).order_by(Activity.due_date.asc()).limit(10).all()

    upcoming = Activity.query.filter(
        Activity.owner_id == uid, Activity.due_date >= tomorrow,
        Activity.completed == False, Activity.deleted_at == None
    ).order_by(Activity.due_date.asc()).limit(10).all()

    def act_dict(a):
        return {'id': a.id, 'type': a.type, 'subject': a.subject, 'due_date': a.due_date.isoformat() if a.due_date else None}

    return jsonify({
        'contacts': contacts,
        'deals': deals,
        'activities': activities,
        'pipeline': pipeline,
        'revenue_trend': revenue_trend,
        'email_engagement': {'total': email_total, 'opened': email_opened, 'clicked': email_clicked},
        'activity_breakdown': activity_breakdown,
        'overdue_activities': [act_dict(a) for a in overdue],
        'due_today_activities': [act_dict(a) for a in due_today],
        'upcoming_activities': [act_dict(a) for a in upcoming],
    })
