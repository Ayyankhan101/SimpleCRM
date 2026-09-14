import time
from datetime import datetime, timezone

from app.models import DataEntry, User, db
from flask import Blueprint, jsonify
from sqlalchemy import text

bp = Blueprint('health', __name__, url_prefix='/api/health')


@bp.route('', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint."""
    checks = {}
    overall_status = 'healthy'

    # Database check
    try:
        start = time.time()
        db.session.execute(text('SELECT 1'))
        checks['database'] = {
            'status': 'healthy',
            'latency_ms': round((time.time() - start) * 1000, 2)
        }
    except Exception as e:
        checks['database'] = {'status': 'unhealthy', 'error': str(e)}
        overall_status = 'degraded'

    # Data stats
    try:
        entry_count = db.session.query(DataEntry).count()
        user_count = db.session.query(User).count()
        checks['data'] = {
            'status': 'healthy',
            'entries': entry_count,
            'users': user_count
        }
    except Exception as e:
        checks['data'] = {'status': 'unhealthy', 'error': str(e)}
        overall_status = 'degraded'

    return jsonify({
        'status': overall_status,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'checks': checks,
        'version': '1.0.0'
    })
