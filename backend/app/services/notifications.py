import hashlib
import hmac
import json
import logging
from datetime import datetime, timezone

import requests
from app.models import DataEntry, NotificationConfig, db

logger = logging.getLogger(__name__)


def send_email_notification(config, subject, body):
    try:
        cfg = json.loads(config.config_json) if isinstance(config.config_json, str) else config.config_json
        api_key = cfg.get('sendgrid_api_key')
        from_email = cfg.get('from_email')
        to_email = cfg.get('to_email')
        
        if not all([api_key, from_email, to_email]):
            logger.error(f'Notification {config.id}: missing email config')
            return False
        
        payload = {
            'personalizations': [{'to': [{'email': to_email}]}],
            'from': {'email': from_email},
            'subject': subject,
            'content': [{'type': 'text/plain', 'value': body}]
        }
        
        resp = requests.post(
            'https://api.sendgrid.com/v3/mail/send',
            json=payload,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            timeout=10
        )
        
        if resp.status_code in (200, 201, 202):
            config.last_sent_at = datetime.now(timezone.utc)
            db.session.commit()
            return True
        
        logger.error(f'Notification {config.id}: email failed {resp.status_code}')
        return False
    except Exception as e:
        logger.error(f'Notification {config.id}: {e}')
        return False


def send_webhook_notification(config, payload):
    try:
        cfg = json.loads(config.config_json) if isinstance(config.config_json, str) else config.config_json
        url = cfg.get('webhook_url')
        secret = cfg.get('webhook_secret')
        
        if not url:
            logger.error(f'Notification {config.id}: missing webhook URL')
            return False
        
        headers = {'Content-Type': 'application/json'}
        body = str(payload)
        
        if secret:
            sig = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()
            headers['X-Webhook-Signature'] = sig
        
        resp = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if resp.status_code < 400:
            config.last_sent_at = datetime.now(timezone.utc)
            db.session.commit()
            return True
        
        logger.error(f'Notification {config.id}: webhook failed {resp.status_code}')
        return False
    except Exception as e:
        logger.error(f'Notification {config.id}: {e}')
        return False


def check_and_notify(user_id):
    configs = NotificationConfig.query.filter_by(
        user_id=user_id,
        is_active=True
    ).all()
    
    if not configs:
        return
    
    latest = DataEntry.query.filter_by(user_id=user_id)\
        .order_by(DataEntry.date.desc()).first()
    
    if not latest:
        return
    
    for config in configs:
        if config.notify_type == 'email':
            subject = f'Data Update: {latest.country or "New Entry"}'
            body = f'New data entry: {latest.title}\nDate: {latest.date}\nConfirmed: {latest.confirmed_cases}\nDeaths: {latest.deaths}'
            send_email_notification(config, subject, body)
        
        elif config.notify_type == 'webhook':
            payload = {
                'event': 'data_update',
                'entry': {
                    'date': latest.date.isoformat() if latest.date else None,
                    'country': latest.country,
                    'confirmed': latest.confirmed_cases,
                    'deaths': latest.deaths
                },
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            send_webhook_notification(config, payload)
