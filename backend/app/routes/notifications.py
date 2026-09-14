import json

from app.models import NotificationConfig, db
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@bp.route('', methods=['GET'])
@login_required
def list_notifications():
    configs = NotificationConfig.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'notify_type': c.notify_type,
        'config': json.loads(c.config_json) if c.config_json else {},
        'is_active': c.is_active,
        'last_sent_at': c.last_sent_at.isoformat() if c.last_sent_at else None
    } for c in configs])


@bp.route('', methods=['POST'])
@login_required
def create_notification():
    data = request.json
    if not data or not data.get('name') or not data.get('notify_type'):
        return jsonify({'error': 'Name and notify_type required'}), 400
    
    config = NotificationConfig(
        name=data['name'],
        notify_type=data['notify_type'],
        config_json=json.dumps(data.get('config', {})),
        is_active=data.get('is_active', True),
        user_id=current_user.id
    )
    db.session.add(config)
    db.session.commit()
    
    return jsonify({
        'id': config.id,
        'name': config.name,
        'notify_type': config.notify_type,
        'config': data.get('config', {}),
        'is_active': config.is_active
    }), 201


@bp.route('/<int:nid>', methods=['PUT'])
@login_required
def update_notification(nid):
    config = NotificationConfig.query.filter_by(id=nid, user_id=current_user.id).first()
    if not config:
        return jsonify({'error': 'Not found'}), 404
    
    data = request.json
    if 'name' in data:
        config.name = data['name']
    if 'config' in data:
        config.config_json = json.dumps(data['config'])
    if 'is_active' in data:
        config.is_active = data['is_active']
    
    db.session.commit()
    return jsonify({
        'id': config.id,
        'name': config.name,
        'notify_type': config.notify_type,
        'config': json.loads(config.config_json) if config.config_json else {},
        'is_active': config.is_active
    })


@bp.route('/<int:nid>', methods=['DELETE'])
@login_required
def delete_notification(nid):
    config = NotificationConfig.query.filter_by(id=nid, user_id=current_user.id).first()
    if not config:
        return jsonify({'error': 'Not found'}), 404
    
    db.session.delete(config)
    db.session.commit()
    return jsonify({'message': 'Deleted'})


@bp.route('/<int:nid>/test', methods=['POST'])
@login_required
def test_notification(nid):
    config = NotificationConfig.query.filter_by(id=nid, user_id=current_user.id).first()
    if not config:
        return jsonify({'error': 'Not found'}), 404
    
    from app.services.notifications import (
        send_email_notification,
        send_webhook_notification,
    )
    
    if config.notify_type == 'email':
        result = send_email_notification(config, 'Test Notification', 'This is a test message.')
    elif config.notify_type == 'webhook':
        result = send_webhook_notification(config, {'event': 'test', 'timestamp': 'now'})
    else:
        return jsonify({'error': 'Unknown notification type'}), 400
    
    return jsonify({'success': result})
