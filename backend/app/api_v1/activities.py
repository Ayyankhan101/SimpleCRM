import math
from datetime import datetime, timezone

from flask import jsonify, request
from flask_login import current_user, login_required

from app.models import Activity, db
from app.schemas import ActivitySchema
from app.api_v1 import activities_blp, _stats_cache


@activities_blp.route('/', methods=['GET'])
@activities_blp.doc(security=[{'Bearer': []}])
@login_required
def list_activities():
    """List activities, optionally filtered by type, deal, or due status, with pagination."""
    activity_type = request.args.get('type')
    deal_id = request.args.get('deal_id', type=int)
    due_filter = request.args.get('due')  # overdue, today, upcoming
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)

    query = Activity.query.filter_by(owner_id=current_user.id, deleted_at=None)
    if activity_type:
        query = query.filter_by(type=activity_type)
    if deal_id:
        query = query.filter_by(deal_id=deal_id)
    if due_filter:
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start.replace(hour=23, minute=59, second=59)
        query = query.filter(Activity.completed == False, Activity.due_date.isnot(None))
        if due_filter == 'overdue':
            query = query.filter(Activity.due_date < today_start)
        elif due_filter == 'today':
            query = query.filter(Activity.due_date >= today_start, Activity.due_date <= today_end)
        elif due_filter == 'upcoming':
            query = query.filter(Activity.due_date > today_end)

    total = query.count()
    items = query.order_by(Activity.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        'items': [a.to_dict() for a in items],
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': math.ceil(total / per_page) if total > 0 else 1,
    })


@activities_blp.route('/', methods=['POST'])
@activities_blp.arguments(ActivitySchema(only=('type', 'subject', 'body', 'outcome', 'deal_id', 'contact_id', 'due_date')))
@activities_blp.response(201, ActivitySchema)
@activities_blp.doc(security=[{'Bearer': []}])
@login_required
def create_activity(data):
    """Log a new activity."""
    activity = Activity(
        type=data['type'],
        subject=data['subject'],
        body=data.get('body'),
        outcome=data.get('outcome'),
        deal_id=data.get('deal_id'),
        contact_id=data.get('contact_id'),
        due_date=data.get('due_date'),
        owner_id=current_user.id,
        org_id=current_user.org_id
    )
    db.session.add(activity)
    db.session.commit()
    _stats_cache.invalidate()
    return activity


@activities_blp.route('/<int:activity_id>', methods=['PUT'])
@activities_blp.arguments(ActivitySchema(only=('type', 'subject', 'body', 'outcome', 'due_date', 'contact_id', 'deal_id', 'completed'), partial=True))
@activities_blp.response(200, ActivitySchema)
@activities_blp.doc(security=[{'Bearer': []}])
@login_required
def update_activity(data, activity_id):
    """Update an existing activity."""
    activity = Activity.query.filter_by(id=activity_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    allowed_fields = {'type', 'subject', 'body', 'outcome', 'deal_id', 'contact_id', 'due_date', 'completed'}
    for key, value in data.items():
        if key in allowed_fields and hasattr(activity, key):
            setattr(activity, key, value)
    if 'completed' in data:
        if data['completed'] and not activity.completed_at:
            activity.completed_at = datetime.now(timezone.utc)
        elif not data['completed']:
            activity.completed_at = None
    db.session.commit()
    _stats_cache.invalidate()
    return activity


@activities_blp.route('/<int:activity_id>', methods=['DELETE'])
@activities_blp.response(204)
@activities_blp.doc(security=[{'Bearer': []}])
@login_required
def delete_activity(activity_id):
    """Soft-delete an activity."""
    activity = Activity.query.filter_by(id=activity_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    activity.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    _stats_cache.invalidate()
    return '', 204
