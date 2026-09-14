from datetime import datetime, timezone

from flask import request
from flask_login import current_user, login_required

from app.models import Contact, db
from app.schemas import ContactSchema
from app.api_v1 import contacts_blp


@contacts_blp.doc(security=[{'Bearer': []}])
@contacts_blp.response(200, ContactSchema(many=True))
@login_required
def list_contacts():
    """List contacts with optional filtering."""
    stage = request.args.get('stage')
    company = request.args.get('company')
    query = Contact.query.filter_by(owner_id=current_user.id, deleted_at=None)
    if stage:
        query = query.filter_by(stage=stage)
    if company:
        query = query.filter(Contact.company.ilike(f'%{company}%'))
    return query.order_by(Contact.created_at.desc()).all()


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


@contacts_blp.doc(security=[{'Bearer': []}])
@contacts_blp.arguments(ContactSchema(only=('first_name', 'last_name', 'email', 'phone', 'company', 'role', 'stage', 'score', 'notes')))
@contacts_blp.response(200, ContactSchema)
@login_required
def update_contact(contact_id, data):
    """Update an existing contact."""
    contact = Contact.query.filter_by(id=contact_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    for key, value in data.items():
        if hasattr(contact, key):
            setattr(contact, key, value)
    contact.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return contact


@contacts_blp.doc(security=[{'Bearer': []}])
@contacts_blp.response(204)
@login_required
def delete_contact(contact_id):
    """Soft-delete a contact."""
    contact = Contact.query.filter_by(id=contact_id, owner_id=current_user.id, deleted_at=None).first_or_404()
    contact.deleted_at = datetime.now(timezone.utc)
    db.session.commit()
    return '', 204
