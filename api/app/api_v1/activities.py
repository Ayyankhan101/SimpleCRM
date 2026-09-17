from datetime import datetime, timezone

from flask import request
from flask_login import current_user, login_required

from app.models import Activity, db
from app.schemas import ActivitySchema
from app.api_v1 import activities_blp


@activities_blp.route('/', methods=['GET'])
@activities_blp.doc(security=[{'Bearer': []}])
@activities_blp.response(200, ActivitySchema(many=True))
@login_required
def list_activities():
    """List activities, optionally filtered by type or deal."""
    activity_type = request.args.get('type')
    deal_id = request.args.get('deal_id', type=int)
    query = Activity.query.filter_by(owner_id=current_user.id, deleted_at=None)
    if activity_type:
        query = query.filter_by(type=activity_type)
    if deal_id:
        query = query.filter_by(deal_id=deal_id)
    return query.order_by(Activity.created_at.desc()).all()


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
    return activity


@activities_blp.route('/<int:activity_id>', methods=['PUT'])
@activities_blp.arguments(ActivitySchema(only=('type', 'subject', 'body', 'outcome', 'due_date', 'contact_id', 'deal_id'), partial=True))
@activities_blp.response(200, ActivitySchema)
@activities_blp.doc(security=[{'Bearer': []}])
@login_required
def update_activity(data, activity_id):
    """Update an existing activity."""
    activity = Activity.query.filter_by(id=activity_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    for key, value in data.items():
        if hasattr(activity, key):
            setattr(activity, key, value)
    db.session.commit()
    return activity
