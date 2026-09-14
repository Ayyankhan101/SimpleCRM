from datetime import date, datetime, timedelta, timezone

from app import cache
from app.models import Category, DataEntry, db
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from sqlalchemy import func

bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@bp.route('/summary', methods=['GET'])
@login_required
def get_summary():
    category_id = request.args.get('category_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    group_name = request.args.get('group_name') or request.args.get('country')

    query = db.session.query(
        func.count(DataEntry.id),
        func.coalesce(func.sum(DataEntry.metric_a), 0),
        func.coalesce(func.sum(DataEntry.metric_b), 0),
        func.coalesce(func.sum(DataEntry.metric_c), 0),
        func.coalesce(func.sum(DataEntry.metric_d), 0),
        func.coalesce(func.sum(DataEntry.metric_e), 0)
    ).filter(DataEntry.user_id == current_user.id)

    if category_id:
        query = query.filter(DataEntry.category_id == category_id)
    if group_name:
        query = query.filter(DataEntry.group_name == group_name)
    if start_date:
        try:
            start_date = date.fromisoformat(start_date)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        query = query.filter(DataEntry.date >= start_date)
    if end_date:
        try:
            end_date = date.fromisoformat(end_date)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        query = query.filter(DataEntry.date <= end_date)

    result = query.first()
    total_entries = result[0] or 0
    total_metric_a = int(result[1] or 0)
    total_metric_b = int(result[2] or 0)
    total_metric_c = int(result[3] or 0)
    total_metric_d = int(result[4] or 0)
    total_metric_e = int(result[5] or 0)

    groups = db.session.query(
        DataEntry.group_name,
        func.sum(DataEntry.metric_a).label('metric_a'),
        func.sum(DataEntry.metric_b).label('metric_b')
    ).filter(DataEntry.user_id == current_user.id)

    if category_id:
        groups = groups.filter(DataEntry.category_id == category_id)
    if start_date:
        groups = groups.filter(DataEntry.date >= start_date)
    if end_date:
        groups = groups.filter(DataEntry.date <= end_date)
    if group_name:
        groups = groups.filter(DataEntry.group_name == group_name)

    groups = groups.group_by(DataEntry.group_name).all()

    group_data = [
        {
            'group_name': g[0],
            'metric_a': int(g[1]) if g[1] else 0,
            'metric_b': int(g[2]) if g[2] else 0
        }
        for g in groups if g[0]
    ]

    group_data.sort(key=lambda x: x['metric_a'], reverse=True)
    top_groups = group_data[:10]

    return jsonify({
        'total_entries': total_entries,
        'total_metric_a': total_metric_a,
        'total_metric_b': total_metric_b,
        'total_metric_c': total_metric_c,
        'total_metric_d': total_metric_d,
        'total_metric_e': total_metric_e,
        'rate_b': round((total_metric_b / total_metric_a * 100), 2) if total_metric_a > 0 else 0,
        'rate_c': round((total_metric_c / total_metric_a * 100), 2) if total_metric_a > 0 else 0,
        'top_groups': top_groups,
        'groups_count': len(group_data)
    })


@bp.route('/trends', methods=['GET'])
@login_required
def get_trends():
    days = request.args.get('days', 30, type=int)
    category_id = request.args.get('category_id', type=int)
    group_name = request.args.get('group_name') or request.args.get('country')

    query = db.session.query(
        DataEntry.date,
        func.sum(DataEntry.metric_a).label('metric_a'),
        func.sum(DataEntry.metric_b).label('metric_b'),
        func.sum(DataEntry.metric_c).label('metric_c'),
        func.sum(DataEntry.metric_d).label('metric_d')
    ).filter(DataEntry.user_id == current_user.id)

    if category_id:
        query = query.filter(DataEntry.category_id == category_id)
    if group_name:
        query = query.filter(DataEntry.group_name == group_name)

    cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=days)
    query = query.filter(DataEntry.date >= cutoff_date)

    query = query.group_by(DataEntry.date).order_by(DataEntry.date)

    trends = [
        {
            'date': r.date.isoformat() if r.date else None,
            'metric_a': int(r.metric_a) if r.metric_a else 0,
            'metric_b': int(r.metric_b) if r.metric_b else 0,
            'metric_c': int(r.metric_c) if r.metric_c else 0,
            'metric_d': int(r.metric_d) if r.metric_d else 0
        }
        for r in query.all()
    ]

    return jsonify({'trends': trends})


@bp.route('/category-breakdown', methods=['GET'])
@login_required
@cache.memoize(timeout=60)
def get_category_breakdown():
    breakdown = db.session.query(
        Category.id,
        Category.name,
        Category.color,
        func.coalesce(func.sum(DataEntry.metric_a), 0).label('total'),
        func.count(DataEntry.id).label('count')
    ).outerjoin(DataEntry, (Category.id == DataEntry.category_id) & (DataEntry.user_id == current_user.id)
    ).filter(Category.user_id == current_user.id
    ).group_by(Category.id).all()

    return jsonify([{
        'category_id': b[0],
        'category_name': b[1],
        'color': b[2],
        'total': int(b[3]) if b[3] else 0,
        'count': b[4]
    } for b in breakdown])


@bp.route('/date-range', methods=['GET'])
@login_required
def get_date_range():
    earliest = db.session.query(func.min(DataEntry.date)).filter(
        DataEntry.user_id == current_user.id
    ).scalar()

    latest = db.session.query(func.max(DataEntry.date)).filter(
        DataEntry.user_id == current_user.id
    ).scalar()

    return jsonify({
        'earliest': earliest.isoformat() if earliest else None,
        'latest': latest.isoformat() if latest else None
    })


@bp.route('/growth-rate', methods=['GET'])
@login_required
def get_growth_rate():
    days = request.args.get('days', 30, type=int)
    group_name = request.args.get('group_name') or request.args.get('country')
    field = request.args.get('field', 'metric_a')

    query = DataEntry.query.filter_by(user_id=current_user.id)

    if group_name:
        query = query.filter_by(group_name=group_name)

    cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=days)
    query = query.filter(DataEntry.date >= cutoff_date)
    query = query.order_by(DataEntry.date)

    entries = query.all()

    from app.services.analytics import calc_growth_rate
    growth = calc_growth_rate(entries, field)

    return jsonify({'growth_rate': growth})


@bp.route('/forecast', methods=['GET'])
@login_required
def get_forecast():
    days = request.args.get('days', 30, type=int)
    forecast_days = request.args.get('forecast_days', 7, type=int)
    group_name = request.args.get('group_name') or request.args.get('country')
    field = request.args.get('field', 'metric_a')

    query = DataEntry.query.filter_by(user_id=current_user.id)

    if group_name:
        query = query.filter_by(group_name=group_name)

    cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=days)
    query = query.filter(DataEntry.date >= cutoff_date)
    query = query.order_by(DataEntry.date)

    entries = query.all()

    from app.services.analytics import forecast_trend
    forecast = forecast_trend(entries, field, forecast_days)

    return jsonify({'forecast': forecast})


@bp.route('/moving-average', methods=['GET'])
@login_required
def get_moving_average():
    days = request.args.get('days', 30, type=int)
    window = request.args.get('window', 7, type=int)
    group_name = request.args.get('group_name') or request.args.get('country')
    field = request.args.get('field', 'metric_a')

    query = DataEntry.query.filter_by(user_id=current_user.id)

    if group_name:
        query = query.filter_by(group_name=group_name)

    cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=days)
    query = query.filter(DataEntry.date >= cutoff_date)
    query = query.order_by(DataEntry.date)

    entries = query.all()

    from app.services.analytics import calc_moving_average
    ma = calc_moving_average(entries, field, window)

    return jsonify({'moving_average': ma})


@bp.route('/anomalies', methods=['GET'])
@login_required
def get_anomalies():
    days = request.args.get('days', 90, type=int)
    threshold = request.args.get('threshold', 3, type=float)
    group_name = request.args.get('group_name') or request.args.get('country')

    query = DataEntry.query.filter_by(user_id=current_user.id)

    if group_name:
        query = query.filter_by(group_name=group_name)

    cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=days)
    query = query.filter(DataEntry.date >= cutoff_date)
    query = query.order_by(DataEntry.date)

    entries = query.all()

    from app.services.analytics import detect_anomalies
    anomalies = detect_anomalies(entries, 'metric_a', threshold)

    return jsonify({'anomalies': anomalies})
