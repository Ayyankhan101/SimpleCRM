from datetime import datetime, timezone
from html import escape as html_escape
from flask import request, jsonify
from flask_login import current_user, login_required
from flask_smorest import Blueprint
from app.models import Contact, Activity, db
from app.services.email import send_email

emails_blp = Blueprint('emails', 'Emails', url_prefix='/api/v1/emails', description='Email sending')


@emails_blp.route('/send', methods=['POST'])
@emails_blp.doc(security=[{'Bearer': []}])
@login_required
def send_contact_email():
    """Send an email to a contact and log it as an activity."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body required'}), 400

    contact_id = data.get('contact_id')
    subject = data.get('subject', '').strip()
    body = data.get('body', '').strip()
    deal_id = data.get('deal_id')

    if not contact_id:
        return jsonify({'error': 'contact_id required'}), 400
    if not subject:
        return jsonify({'error': 'Subject required'}), 400
    if not body:
        return jsonify({'error': 'Email body required'}), 400

    contact = Contact.query.filter_by(
        id=contact_id, owner_id=current_user.id, deleted_at=None
    ).first()
    if not contact:
        return jsonify({'error': 'Contact not found'}), 404
    if not contact.email:
        return jsonify({'error': 'Contact has no email address'}), 400

    safe_subject = html_escape(subject)
    safe_body = html_escape(body).replace('\n', '<br>')
    html_content = f"""<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="padding:16px;background:#f9fafb;border-radius:8px;margin-bottom:16px;">
        <p style="margin:0;color:#6b7280;font-size:12px;">Sent by SimpleCRM</p>
      </div>
      <div style="line-height:1.6;">{safe_body}</div>
    </div>"""

    sent = send_email(contact.email, safe_subject, html_content)
    if not sent:
        return jsonify({'error': 'Failed to send email'}), 500

    activity = Activity(
        type='email',
        subject=safe_subject,
        body=body,
        contact_id=contact.id,
        deal_id=deal_id,
        owner_id=current_user.id,
        org_id=current_user.org_id,
        completed=True,
        completed_at=datetime.now(timezone.utc),
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({
        'message': f'Email sent to {contact.email}',
        'activity': activity.to_dict()
    }), 200
