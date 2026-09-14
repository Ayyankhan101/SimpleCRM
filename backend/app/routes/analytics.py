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
    country = request.args.get('country')
    
    query = db.session.query(
        func.count(DataEntry.id),
        func.coalesce(func.sum(DataEntry.confirmed_cases), 0),
        func.coalesce(func.sum(DataEntry.deaths), 0),
        func.coalesce(func.sum(DataEntry.recovered), 0),
        func.coalesce(func.sum(DataEntry.active_cases), 0),
        func.coalesce(func.sum(DataEntry.population), 0)
    ).filter(DataEntry.user_id == current_user.id)
    
    if category_id:
        query = query.filter(DataEntry.category_id == category_id)
    if country:
        query = query.filter(DataEntry.country == country)
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
    total_confirmed = int(result[1] or 0)
    total_deaths = int(result[2] or 0)
    total_recovered = int(result[3] or 0)
    total_active = int(result[4] or 0)
    total_population = int(result[5] or 0)
    
    countries = db.session.query(
        DataEntry.country,
        func.sum(DataEntry.confirmed_cases).label('confirmed'),
        func.sum(DataEntry.deaths).label('deaths')
    ).filter(DataEntry.user_id == current_user.id)
    
    if category_id:
        countries = countries.filter(DataEntry.category_id == category_id)
    if start_date:
        countries = countries.filter(DataEntry.date >= start_date)
    if end_date:
        countries = countries.filter(DataEntry.date <= end_date)
    if country:
        countries = countries.filter(DataEntry.country == country)
    
    countries = countries.group_by(DataEntry.country).all()
    
    country_data = [
        {
            'country': c[0],
            'confirmed': int(c[1]) if c[1] else 0,
            'deaths': int(c[2]) if c[2] else 0
        }
        for c in countries if c[0]
    ]
    
    country_data.sort(key=lambda x: x['confirmed'], reverse=True)
    top_countries = country_data[:10]
    
    return jsonify({
        'total_entries': total_entries,
        'total_confirmed': total_confirmed,
        'total_deaths': total_deaths,
        'total_recovered': total_recovered,
        'total_active': total_active,
        'total_population': total_population,
        'mortality_rate': round((total_deaths / total_confirmed * 100), 2) if total_confirmed > 0 else 0,
        'recovery_rate': round((total_recovered / total_confirmed * 100), 2) if total_confirmed > 0 else 0,
        'top_countries': top_countries,
        'countries_count': len(country_data)
    })


@bp.route('/trends', methods=['GET'])
@login_required
def get_trends():
    days = request.args.get('days', 30, type=int)
    category_id = request.args.get('category_id', type=int)
    country = request.args.get('country')
    
    query = db.session.query(
        DataEntry.date,
        func.sum(DataEntry.confirmed_cases).label('confirmed'),
        func.sum(DataEntry.deaths).label('deaths'),
        func.sum(DataEntry.recovered).label('recovered'),
        func.sum(DataEntry.active_cases).label('active')
    ).filter(DataEntry.user_id == current_user.id)
    
    if category_id:
        query = query.filter(DataEntry.category_id == category_id)
    if country:
        query = query.filter(DataEntry.country == country)
    
    cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=days)
    query = query.filter(DataEntry.date >= cutoff_date)
    
    query = query.group_by(DataEntry.date).order_by(DataEntry.date)
    
    trends = [
        {
            'date': r.date.isoformat() if r.date else None,
            'confirmed': int(r.confirmed) if r.confirmed else 0,
            'deaths': int(r.deaths) if r.deaths else 0,
            'recovered': int(r.recovered) if r.recovered else 0,
            'active': int(r.active) if r.active else 0
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
        func.coalesce(func.sum(DataEntry.confirmed_cases), 0).label('total'),
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
    country = request.args.get('country')
    field = request.args.get('field', 'confirmed_cases')
    
    query = DataEntry.query.filter_by(user_id=current_user.id)
    
    if country:
        query = query.filter_by(country=country)
    
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
    country = request.args.get('country')
    field = request.args.get('field', 'confirmed_cases')
    
    query = DataEntry.query.filter_by(user_id=current_user.id)
    
    if country:
        query = query.filter_by(country=country)
    
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
    country = request.args.get('country')
    field = request.args.get('field', 'confirmed_cases')
    
    query = DataEntry.query.filter_by(user_id=current_user.id)
    
    if country:
        query = query.filter_by(country=country)
    
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
    country = request.args.get('country')
    
    query = DataEntry.query.filter_by(user_id=current_user.id)
    
    if country:
        query = query.filter_by(country=country)
    
    cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=days)
    query = query.filter(DataEntry.date >= cutoff_date)
    query = query.order_by(DataEntry.date)
    
    entries = query.all()
    
    from app.services.analytics import detect_anomalies
    anomalies = detect_anomalies(entries, 'confirmed_cases', threshold)
    
    return jsonify({'anomalies': anomalies})
