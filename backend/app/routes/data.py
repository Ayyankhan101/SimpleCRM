import json
import io
import csv
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, DataEntry, Category

bp = Blueprint('data', __name__, url_prefix='/api/data')


@bp.route('', methods=['GET'])
@login_required
def get_entries():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    category_id = request.args.get('category_id', type=int)
    country = request.args.get('country')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search')
    
    query = DataEntry.query.filter_by(user_id=current_user.id)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if country:
        query = query.filter_by(country=country)
    
    if start_date:
        from datetime import datetime
        query = query.filter(DataEntry.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    
    if end_date:
        from datetime import datetime
        query = query.filter(DataEntry.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    if search:
        query = query.filter(DataEntry.title.ilike(f'%{search}%'))
    
    query = query.order_by(DataEntry.date.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'entries': [entry.to_dict() for entry in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })


@bp.route('/<int:id>', methods=['GET'])
@login_required
def get_entry(id):
    entry = DataEntry.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    return jsonify(entry.to_dict())


@bp.route('', methods=['POST'])
@login_required
def create_entry():
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('date'):
        return jsonify({'error': 'Title and date are required'}), 400
    
    entry = DataEntry(
        title=data['title'],
        date=data['date'],
        country=data.get('country'),
        region=data.get('region'),
        confirmed_cases=data.get('confirmed_cases', 0),
        deaths=data.get('deaths', 0),
        recovered=data.get('recovered', 0),
        active_cases=data.get('active_cases', 0),
        population=data.get('population', 0),
        values_json=json.dumps(data.get('values', {})) if data.get('values') else None,
        category_id=data.get('category_id'),
        user_id=current_user.id
    )
    
    db.session.add(entry)
    db.session.commit()
    
    return jsonify(entry.to_dict()), 201


@bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_entry(id):
    entry = DataEntry.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    data = request.get_json()
    
    if data.get('title'):
        entry.title = data['title']
    if data.get('date'):
        entry.date = data['date']
    if 'country' in data:
        entry.country = data['country']
    if 'region' in data:
        entry.region = data['region']
    if 'confirmed_cases' in data:
        entry.confirmed_cases = data['confirmed_cases']
    if 'deaths' in data:
        entry.deaths = data['deaths']
    if 'recovered' in data:
        entry.recovered = data['recovered']
    if 'active_cases' in data:
        entry.active_cases = data['active_cases']
    if 'population' in data:
        entry.population = data['population']
    if 'values' in data:
        entry.values_json = json.dumps(data['values'])
    if 'category_id' in data:
        entry.category_id = data['category_id']
    
    db.session.commit()
    
    return jsonify(entry.to_dict())


@bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_entry(id):
    entry = DataEntry.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({'message': 'Entry deleted successfully'})


@bp.route('/bulk', methods=['DELETE'])
@login_required
def bulk_delete():
    data = request.get_json()
    ids = data.get('ids', [])
    
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    
    deleted = DataEntry.query.filter(
        DataEntry.id.in_(ids),
        DataEntry.user_id == current_user.id
    ).delete(synchronize_session=False)
    
    db.session.commit()
    
    return jsonify({'message': f'{deleted} entries deleted', 'deleted': deleted})


@bp.route('/import', methods=['POST'])
@login_required
def import_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported'}), 400
    
    try:
        stream = io.StringIO(file.stream.read().decode('UTF-8'), newline=None)
        csv_reader = csv.DictReader(stream)
        
        entries = []
        for row in csv_reader:
            from datetime import datetime
            
            entry = DataEntry(
                title=row.get('title', f"Data - {row.get('date', '')}"),
                date=datetime.strptime(row.get('date', '2020-01-01'), '%Y-%m-%d').date() if row.get('date') else datetime.now().date(),
                country=row.get('country'),
                region=row.get('region'),
                confirmed_cases=int(row.get('confirmed_cases', 0)) if row.get('confirmed_cases') else 0,
                deaths=int(row.get('deaths', 0)) if row.get('deaths') else 0,
                recovered=int(row.get('recovered', 0)) if row.get('recovered') else 0,
                active_cases=int(row.get('active_cases', 0)) if row.get('active_cases') else 0,
                population=int(row.get('population', 0)) if row.get('population') else 0,
                category_id=int(row.get('category_id')) if row.get('category_id') else None,
                user_id=current_user.id
            )
            entries.append(entry)
        
        db.session.add_all(entries)
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully imported {len(entries)} entries',
            'count': len(entries)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@bp.route('/export', methods=['GET'])
@login_required
def export_csv():
    entries = DataEntry.query.filter_by(user_id=current_user.id).order_by(DataEntry.date.desc()).all()
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        'id', 'title', 'date', 'country', 'region', 'confirmed_cases',
        'deaths', 'recovered', 'active_cases', 'population', 'category_id'
    ])
    writer.writeheader()
    
    for entry in entries:
        writer.writerow({
            'id': entry.id,
            'title': entry.title,
            'date': entry.date.isoformat() if entry.date else '',
            'country': entry.country or '',
            'region': entry.region or '',
            'confirmed_cases': entry.confirmed_cases,
            'deaths': entry.deaths,
            'recovered': entry.recovered,
            'active_cases': entry.active_cases,
            'population': entry.population,
            'category_id': entry.category_id or ''
        })
    
    return output.getvalue(), 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=data_export.csv'
    }


@bp.route('/countries', methods=['GET'])
@login_required
def get_countries():
    countries = db.session.query(DataEntry.country).filter(
        DataEntry.user_id == current_user.id,
        DataEntry.country.isnot(None)
    ).distinct().all()
    
    return jsonify([c[0] for c in countries if c[0]])
