import hashlib
import hmac
import logging
from datetime import date, datetime, timezone

from app.models import DataEntry, DataSource, db
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

logger = logging.getLogger(__name__)

bp = Blueprint('webhooks', __name__, url_prefix='/api/webhooks')


@bp.route('/<int:source_id>/receive', methods=['POST'])
def receive_webhook(source_id):
    source = DataSource.query.filter_by(id=source_id, source_type='webhook').first()
    if not source:
        return jsonify({'error': 'Webhook source not found'}), 404

    config = source.get_config()
    secret = config.get('secret')

    if secret:
        signature = request.headers.get('X-Webhook-Signature')
        if not signature:
            return jsonify({'error': 'Missing signature'}), 401

        body = request.get_data()
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return jsonify({'error': 'Invalid signature'}), 401

    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'No JSON payload'}), 400

        field_mapping = config.get('field_mapping', {})

        entries_data = data if isinstance(data, list) else [data]
        count = 0

        for item in entries_data:
            if field_mapping:
                mapped = {}
                for api_field, db_field in field_mapping.items():
                    if api_field in item:
                        mapped[db_field] = item[api_field]
            else:
                mapped = item

            if not mapped.get('date'):
                continue

            try:
                entry_date = date.fromisoformat(mapped['date']) if isinstance(mapped['date'], str) else mapped['date']
            except (ValueError, TypeError):
                continue

            entry = DataEntry(
                title=mapped.get('title', 'Webhook Import'),
                date=entry_date,
                group_name=mapped.get('group_name') or mapped.get('country'),
                subgroup_name=mapped.get('subgroup_name') or mapped.get('region'),
                metric_a=int(mapped.get('metric_a', 0) or mapped.get('confirmed_cases', 0)),
                metric_b=int(mapped.get('metric_b', 0) or mapped.get('deaths', 0)),
                metric_c=int(mapped.get('metric_c', 0) or mapped.get('recovered', 0)),
                metric_d=int(mapped.get('metric_d', 0) or mapped.get('active_cases', 0)),
                metric_e=int(mapped.get('metric_e', 0) or mapped.get('population', 0)),
                source_id=source.id,
                source_type='webhook',
                user_id=source.user_id,
            )
            db.session.add(entry)
            count += 1

        source.last_sync_at = datetime.now(timezone.utc)
        db.session.commit()

        logger.info(f"Received {count} entries via webhook for source {source_id}")
        return jsonify({'received': count})

    except Exception as e:
        db.session.rollback()
        logger.exception(f"Webhook processing failed for source {source_id}")
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['GET'])
@login_required
def list_webhooks():
    sources = DataSource.query.filter_by(
        user_id=current_user.id,
        source_type='webhook'
    ).all()
    return jsonify([s.to_dict() for s in sources])
