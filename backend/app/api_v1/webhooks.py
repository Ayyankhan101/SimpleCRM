import logging
from datetime import datetime, timezone
from flask import request, jsonify
from flask_smorest import Blueprint
from app.models import Activity, db

webhooks_blp = Blueprint('webhooks', 'Webhooks', url_prefix='/api/v1/webhooks', description='External webhooks')
logger = logging.getLogger(__name__)


@webhooks_blp.route('/resend', methods=['POST'])
def resend_webhook():
    """Receive Resend webhook events for email tracking."""
    payload = request.get_json()
    if not payload:
        return jsonify({'error': 'No payload'}), 400

    event_type = payload.get('type', '')
    data = payload.get('data', {})
    email_id = data.get('email_id')

    logger.info(f"Webhook received: type={event_type} email_id={email_id}")

    if not email_id:
        return jsonify({'ok': True}), 200

    activity = Activity.query.filter_by(resend_email_id=email_id).first()
    if not activity:
        logger.warning(f"Webhook: no activity for email_id={email_id}")
        return jsonify({'ok': True}), 200

    now = datetime.now(timezone.utc)

    if event_type == 'email.opened':
        if not activity.email_opened_at:
            activity.email_opened_at = now
            db.session.commit()
            logger.info(f"Activity {activity.id}: marked as opened")

    elif event_type == 'email.clicked':
        if not activity.email_clicked_at:
            activity.email_clicked_at = now
            db.session.commit()
            logger.info(f"Activity {activity.id}: marked as clicked")
        # Also mark opened if not already
        if not activity.email_opened_at:
            activity.email_opened_at = now
            db.session.commit()

    return jsonify({'ok': True}), 200
