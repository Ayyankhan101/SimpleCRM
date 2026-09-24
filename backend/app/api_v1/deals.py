import math
from collections import defaultdict
from datetime import datetime, timezone

from flask import jsonify, request
from flask_login import current_user, login_required

from app.models import Deal, db
from app.schemas import DealSchema
from app.api_v1 import deals_blp, _stats_cache

PIPELINE_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']


@deals_blp.route('/', methods=['GET'])
@deals_blp.doc(security=[{'Bearer': []}])
@login_required
def list_deals():
    """List deals with optional stage filter and pagination."""
    stage = request.args.get('stage')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)

    query = Deal.query.filter_by(owner_id=current_user.id, deleted_at=None)
    if stage:
        query = query.filter_by(stage=stage)

    total = query.count()
    items = query.order_by(Deal.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        'items': [d.to_dict() for d in items],
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': math.ceil(total / per_page) if total > 0 else 1,
    })


@deals_blp.route('/pipeline', methods=['GET'])
@deals_blp.doc(security=[{'Bearer': []}])
@login_required
def get_pipeline():
    """Get deals grouped by pipeline stage for kanban board."""
    deals = Deal.query.filter_by(owner_id=current_user.id, deleted_at=None).order_by(Deal.created_at.desc()).all()
    grouped = defaultdict(list)
    for deal in deals:
        grouped[deal.stage].append(deal.to_dict())
    pipeline = {stage: grouped.get(stage, []) for stage in PIPELINE_STAGES}
    return jsonify({'pipeline': pipeline, 'stages': PIPELINE_STAGES, 'total': len(deals)})


@deals_blp.route('/', methods=['POST'])
@deals_blp.arguments(DealSchema(only=('title', 'value', 'currency', 'stage', 'probability', 'expected_close_date', 'contact_id', 'notes')))
@deals_blp.response(201, DealSchema)
@deals_blp.doc(security=[{'Bearer': []}])
@login_required
def create_deal(data):
    """Create a new deal."""
    deal = Deal(
        title=data['title'],
        value=data['value'],
        currency=data.get('currency', 'USD'),
        stage=data.get('stage', 'lead'),
        probability=data.get('probability', 10),
        expected_close_date=data.get('expected_close_date'),
        contact_id=data.get('contact_id'),
        notes=data.get('notes'),
        owner_id=current_user.id,
        org_id=current_user.org_id
    )
    db.session.add(deal)
    db.session.commit()
    _stats_cache.invalidate()
    return deal


@deals_blp.route('/<int:deal_id>', methods=['PUT'])
@deals_blp.doc(security=[{'Bearer': []}])
@deals_blp.arguments(DealSchema(only=('title', 'value', 'currency', 'stage', 'probability', 'expected_close_date', 'contact_id', 'notes'), partial=True))
@deals_blp.response(200, DealSchema)
@login_required
def update_deal(data, deal_id):
    """Update an existing deal."""
    deal = Deal.query.filter_by(id=deal_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    for key, value in data.items():
        if hasattr(deal, key):
            setattr(deal, key, value)
    deal.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    _stats_cache.invalidate()
    return deal


@deals_blp.route('/<int:deal_id>', methods=['DELETE'])
@deals_blp.doc(security=[{'Bearer': []}])
@deals_blp.response(204)
@login_required
def delete_deal(deal_id):
    """Soft-delete a deal."""
    deal = Deal.query.filter_by(id=deal_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    deal.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    _stats_cache.invalidate()
    return '', 204
