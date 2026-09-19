from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_login import current_user, login_required
from app.models import Activity, db
from app.services.email import send_daily_digest, is_configured

reminders_blp = Blueprint('reminders', 'Reminders', url_prefix='/api/v1/reminders', description='Activity reminders')


@reminders_blp.route('/digest', methods=['POST'])
@login_required
def send_digest():
    if not is_configured():
        return jsonify({'error': 'Email not configured (RESEND_API_KEY missing)'}), 503

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    today_end = today_start.replace(hour=23, minute=59, second=59)

    base_filter = [
        Activity.owner_id == current_user.id,
        Activity.deleted_at.is_(None),
        Activity.completed == False,
        Activity.due_date.isnot(None),
    ]

    overdue = Activity.query.filter(*base_filter, Activity.due_date < today_start).order_by(Activity.due_date.asc()).all()
    due_today = Activity.query.filter(*base_filter, Activity.due_date >= today_start, Activity.due_date <= today_end).order_by(Activity.due_date.asc()).all()
    upcoming = Activity.query.filter(*base_filter, Activity.due_date > today_end).order_by(Activity.due_date.asc()).limit(10).all()

    total = len(overdue) + len(due_today) + len(upcoming)
    if total == 0:
        return jsonify({'message': 'No pending activities', 'sent': False})

    user_name = current_user.username or current_user.email.split('@')[0]
    sent = send_daily_digest(current_user.email, user_name, overdue, due_today, upcoming)

    if sent:
        current_user.last_digest_sent_at = now.replace(tzinfo=None)
        db.session.commit()

    return jsonify({
        'message': f'Digest sent ({total} activities)' if sent else 'Failed to send digest',
        'sent': sent,
        'overdue': len(overdue),
        'due_today': len(due_today),
        'upcoming': len(upcoming),
    })


@reminders_blp.route('/check', methods=['GET'])
@login_required
def check_reminders():
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    today_end = today_start.replace(hour=23, minute=59, second=59)

    base_filter = [
        Activity.owner_id == current_user.id,
        Activity.deleted_at.is_(None),
        Activity.completed == False,
        Activity.due_date.isnot(None),
    ]

    overdue = Activity.query.filter(*base_filter, Activity.due_date < today_start).count()
    due_today = Activity.query.filter(*base_filter, Activity.due_date >= today_start, Activity.due_date <= today_end).count()
    upcoming = Activity.query.filter(*base_filter, Activity.due_date > today_end).limit(10).count()

    last_sent = current_user.last_digest_sent_at
    should_send = (overdue + due_today) > 0 and (
        not last_sent or last_sent.replace(tzinfo=None) < today_start
    )

    return jsonify({
        'overdue': overdue,
        'due_today': due_today,
        'upcoming': upcoming,
        'should_send_digest': should_send,
        'email_configured': is_configured(),
        'last_digest_sent': last_sent.isoformat() if last_sent else None,
    })
