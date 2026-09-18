from flask_smorest import Blueprint
from flask import jsonify
from flask_login import login_required, current_user
from app.models import Contact, Deal, Activity, db
from sqlalchemy import func

contacts_blp = Blueprint('contacts', 'Contacts', url_prefix='/api/v1/contacts', description='Contact management')
deals_blp = Blueprint('deals', 'Deals', url_prefix='/api/v1/deals', description='Deal pipeline')
activities_blp = Blueprint('activities', 'Activities', url_prefix='/api/v1/activities', description='Activity tracking')
stats_blp = Blueprint('stats', 'Stats', url_prefix='/api/v1/stats', description='Dashboard statistics')


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

    upcoming = (
        db.session.query(Activity)
        .filter(
            Activity.owner_id == current_user.id,
            Activity.deleted_at.is_(None),
            Activity.completed == False,
            Activity.due_date.isnot(None),
        )
        .order_by(Activity.due_date.asc())
        .limit(5)
        .all()
    )
    upcoming_activities = [a.to_dict() for a in upcoming]

    return jsonify({
        'contacts': contact_count,
        'deals': deal_count,
        'activities': activity_count,
        'pipeline': pipeline,
        'upcoming_activities': upcoming_activities,
    })
