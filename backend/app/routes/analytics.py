from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models import db, DataEntry, Category

bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')


@bp.route('/summary', methods=['GET'])
@login_required
def get_summary():
    category_id = request.args.get('category_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    country = request.args.get('country')
    
    query = DataEntry.query.filter_by(user_id=current_user.id)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if country:
        query = query.filter_by(country=country)
    
    if start_date:
        query = query.filter(DataEntry.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        query = query.filter(DataEntry.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    entries = query.all()
    
    total_confirmed = sum(e.confirmed_cases for e in entries)
    total_deaths = sum(e.deaths for e in entries)
    total_recovered = sum(e.recovered for e in entries)
    total_active = sum(e.active_cases for e in entries)
    total_population = sum(e.population for e in entries)
    
    countries = db.session.query(
        DataEntry.country,
        func.sum(DataEntry.confirmed_cases).label('confirmed'),
        func.sum(DataEntry.deaths).label('deaths')
    ).filter(DataEntry.user_id == current_user.id)
    
    if category_id:
        countries = countries.filter(DataEntry.category_id == category_id)
    if start_date:
        countries = countries.filter(DataEntry.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        countries = countries.filter(DataEntry.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
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
        'total_entries': len(entries),
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
    
    query = DataEntry.query.filter_by(user_id=current_user.id)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    if country:
        query = query.filter_by(country=country)
    
    entries = query.order_by(DataEntry.date).all()
    
    if not entries:
        return jsonify({'trends': []})
    
    from collections import defaultdict
    by_date = defaultdict(lambda: {'confirmed': 0, 'deaths': 0, 'recovered': 0, 'active': 0})
    
    for entry in entries:
        date_str = entry.date.isoformat() if entry.date else None
        if date_str:
            by_date[date_str]['confirmed'] += entry.confirmed_cases
            by_date[date_str]['deaths'] += entry.deaths
            by_date[date_str]['recovered'] += entry.recovered
            by_date[date_str]['active'] += entry.active_cases
    
    trends = [
        {
            'date': date,
            'confirmed': data['confirmed'],
            'deaths': data['deaths'],
            'recovered': data['recovered'],
            'active': data['active']
        }
        for date, data in sorted(by_date.items())
    ]
    
    return jsonify({'trends': trends})


@bp.route('/category-breakdown', methods=['GET'])
@login_required
def get_category_breakdown():
    categories = Category.query.filter_by(user_id=current_user.id).all()
    
    breakdown = []
    for cat in categories:
        entries = DataEntry.query.filter_by(
            user_id=current_user.id,
            category_id=cat.id
        ).all()
        
        total = sum(e.confirmed_cases for e in entries)
        breakdown.append({
            'category_id': cat.id,
            'category_name': cat.name,
            'color': cat.color,
            'total': total,
            'count': len(entries)
        })
    
    breakdown.sort(key=lambda x: x['total'], reverse=True)
    
    return jsonify(breakdown)


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
