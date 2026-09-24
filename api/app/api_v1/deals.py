from datetime import datetime, timezone

from flask import request
from flask_login import current_user, login_required

from app.models import Deal, db
from app.schemas import DealSchema
from app.api_v1 import deals_blp


@deals_blp.route('/', methods=['GET'])
@deals_blp.doc(security=[{'Bearer': []}])
@deals_blp.response(200, DealSchema(many=True))
@login_required
def list_deals():
    """List deals with optional stage filter."""
    stage = request.args.get('stage')
    query = Deal.query.filter_by(owner_id=current_user.id, deleted_at=None)
    if stage:
        query = query.filter_by(stage=stage)
    return query.order_by(Deal.created_at.desc()).all()


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
    return '', 204
