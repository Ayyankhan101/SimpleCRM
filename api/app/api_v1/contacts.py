from datetime import datetime, timezone

from flask import jsonify, request
from flask_login import current_user, login_required

from app.models import Contact, Deal, Activity, db
from app.schemas import ContactSchema, ContactDetailSchema
from app.api_v1 import contacts_blp


@contacts_blp.route('/', methods=['GET'])
@contacts_blp.doc(security=[{'Bearer': []}])
@contacts_blp.response(200, ContactSchema(many=True))
@login_required
def list_contacts():
    """List contacts with optional filtering."""
    stage = request.args.get('stage')
    company = request.args.get('company')
    query = Contact.query.filter_by(owner_id=current_user.id, deleted_at=None)
    if stage:
        query = query.filter(Contact.stage.ilike(stage))
    if company:
        query = query.filter(Contact.company.ilike(f'%{company}%'))
    return query.order_by(Contact.created_at.desc()).all()


@contacts_blp.route('/<int:contact_id>', methods=['GET'])
@contacts_blp.doc(security=[{'Bearer': []}])
@login_required
def get_contact(contact_id):
    """Get a single contact with linked deals and activities."""
    contact = Contact.query.filter_by(
        id=contact_id, owner_id=current_user.id, deleted_at=None
    ).first_or_404()
    deals = Deal.query.filter_by(
        contact_id=contact.id, owner_id=current_user.id, deleted_at=None
    ).order_by(Deal.created_at.desc()).all()
    activities = Activity.query.filter_by(
        contact_id=contact.id, owner_id=current_user.id, deleted_at=None
    ).order_by(Activity.created_at.desc()).all()
    result = ContactDetailSchema().dump(contact)
    result['deals'] = [d.to_dict() for d in deals]
    result['activities'] = [a.to_dict() for a in activities]
    return jsonify(result)


@contacts_blp.route('/', methods=['POST'])
@contacts_blp.arguments(ContactSchema(only=('first_name', 'last_name', 'email', 'phone', 'company', 'role', 'stage', 'score', 'notes')))
@contacts_blp.response(201, ContactSchema)
@contacts_blp.doc(security=[{'Bearer': []}])
@login_required
def create_contact(data):
    """Create a new contact."""
    contact = Contact(
        first_name=data['first_name'],
        last_name=data.get('last_name'),
        email=data.get('email'),
        phone=data.get('phone'),
        company=data.get('company'),
        role=data.get('role'),
        stage=data.get('stage', 'lead'),
        score=data.get('score', 0),
        notes=data.get('notes'),
        owner_id=current_user.id,
        org_id=current_user.org_id
    )
    db.session.add(contact)
    db.session.commit()
    return contact


@contacts_blp.route('/<int:contact_id>', methods=['PUT'])
@contacts_blp.doc(security=[{'Bearer': []}])
@contacts_blp.arguments(ContactSchema(only=('first_name', 'last_name', 'email', 'phone', 'company', 'role', 'stage', 'score', 'notes'), partial=True))
@contacts_blp.response(200, ContactSchema)
@login_required
def update_contact(data, contact_id):
    """Update an existing contact."""
    contact = Contact.query.filter_by(id=contact_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    for key, value in data.items():
        if hasattr(contact, key):
            setattr(contact, key, value)
    contact.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return contact


@contacts_blp.route('/<int:contact_id>', methods=['DELETE'])
@contacts_blp.doc(security=[{'Bearer': []}])
@contacts_blp.response(204)
@login_required
def delete_contact(contact_id):
    """Soft-delete a contact."""
    contact = Contact.query.filter_by(id=contact_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    contact.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    return '', 204
