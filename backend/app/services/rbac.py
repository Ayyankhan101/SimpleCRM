import json
import logging
from datetime import datetime, timezone

from app.models import AuditLog, db
from flask import request
from flask_login import current_user

logger = logging.getLogger(__name__)


def log_audit(action, entity_type, entity_id=None, changes=None):
    """Write an audit log entry for the current user."""
    if not current_user.is_authenticated:
        return
    changes_json = json.dumps(changes) if changes else None
    entry = AuditLog(
        user_id=current_user.id,
        org_id=current_user.org_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        changes=changes_json,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(entry)
    db.session.commit()


def require_role(*roles):
    """Decorator: abort 403 if current_user.role not in allowed roles."""
    from functools import wraps
    from flask import abort

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                abort(401)
            if current_user.role not in roles:
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator
