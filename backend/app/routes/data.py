import csv
import io
import json
import logging
from datetime import date, datetime, timezone

from app import cache
from app.models import Category, DataEntry, db
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

logger = logging.getLogger(__name__)

bp = Blueprint('data', __name__, url_prefix='/api/data')


@bp.route('', methods=['GET'])
@login_required
def get_entries():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 50, type=int), 100)
    category_id = request.args.get('category_id', type=int)
    country = request.args.get('country')
    region = request.args.get('region')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search')
    
    query = DataEntry.query.filter_by(user_id=current_user.id)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if country:
        query = query.filter_by(country=country)
    
    if region:
        query = query.filter_by(region=region)
    
    if start_date:
        try:
            query = query.filter(DataEntry.date >= date.fromisoformat(start_date))
        except ValueError:
            return jsonify({'error': 'Invalid start_date format'}), 400
    
    if end_date:
        try:
            query = query.filter(DataEntry.date <= date.fromisoformat(end_date))
        except ValueError:
            return jsonify({'error': 'Invalid end_date format'}), 400
    
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
    
    try:
        entry_date = date.fromisoformat(data['date'])
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    if data.get('confirmed_cases', 0) < 0 or data.get('deaths', 0) < 0 or data.get('recovered', 0) < 0:
        return jsonify({'error': 'Cases cannot be negative'}), 400
    
    if data.get('category_id'):
        category = Category.query.filter_by(id=data['category_id'], user_id=current_user.id).first()
        if not category:
            return jsonify({'error': 'Category not found'}), 400
    
    try:
        entry = DataEntry(
            title=data['title'],
            date=entry_date,
            country=data.get('country'),
            region=data.get('region'),
            confirmed_cases=data.get('confirmed_cases', 0),
            deaths=data.get('deaths', 0),
            recovered=data.get('recovered', 0),
            active_cases=data.get('active_cases', 0),
            population=data.get('population', 0),
            values_json=json.dumps(data.get('values', {})) if data.get('values') else None,
            metrics_json=json.dumps(data.get('metrics', {})) if data.get('metrics') else None,
            source_id=data.get('source_id'),
            source_type=data.get('source_type', 'manual'),
            category_id=data.get('category_id'),
            user_id=current_user.id
        )
        
        db.session.add(entry)
        db.session.commit()
        
        return jsonify(entry.to_dict()), 201
    except Exception:
        db.session.rollback()
        logger.exception("Failed to create entry")
        return jsonify({'error': 'Failed to create entry'}), 500


@bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_entry(id):
    entry = DataEntry.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if data.get('date'):
        try:
            entry.date = date.fromisoformat(data['date'])
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    try:
        if data.get('title'):
            entry.title = data['title']
        if 'country' in data:
            entry.country = data['country']
        if 'region' in data:
            entry.region = data['region']
        if 'confirmed_cases' in data:
            if data['confirmed_cases'] < 0:
                return jsonify({'error': 'Cases cannot be negative'}), 400
            entry.confirmed_cases = data['confirmed_cases']
        if 'deaths' in data:
            if data['deaths'] < 0:
                return jsonify({'error': 'Deaths cannot be negative'}), 400
            entry.deaths = data['deaths']
        if 'recovered' in data:
            if data['recovered'] < 0:
                return jsonify({'error': 'Recovered cannot be negative'}), 400
            entry.recovered = data['recovered']
        if 'active_cases' in data:
            entry.active_cases = data['active_cases']
        if 'population' in data:
            entry.population = data['population']
        if 'values' in data:
            entry.values_json = json.dumps(data['values'])
        if 'metrics' in data:
            entry.metrics_json = json.dumps(data['metrics'])
        if 'category_id' in data:
            entry.category_id = data['category_id']
        
        db.session.commit()
        
        return jsonify(entry.to_dict())
    except Exception:
        db.session.rollback()
        logger.exception("Failed to update entry")
        return jsonify({'error': 'Failed to update entry'}), 500


@bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_entry(id):
    entry = DataEntry.query.filter_by(id=id, user_id=current_user.id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({'message': 'Entry deleted successfully'})
    except Exception:
        db.session.rollback()
        logger.exception("Failed to delete entry")
        return jsonify({'error': 'Failed to delete entry'}), 500


@bp.route('/bulk', methods=['DELETE'])
@login_required
def bulk_delete():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    ids = data.get('ids', [])
    
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    
    try:
        deleted = DataEntry.query.filter(
            DataEntry.id.in_(ids),
            DataEntry.user_id == current_user.id
        ).delete(synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({'message': f'{deleted} entries deleted', 'deleted': deleted})
    except Exception:
        db.session.rollback()
        logger.exception("Failed to delete entries")
        return jsonify({'error': 'Failed to delete entries'}), 500


@bp.route('/import', methods=['POST'])
@login_required
def import_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    file.seek(0, 2)
    if file.tell() > 5 * 1024 * 1024:
        return jsonify({'error': 'File too large (max 5MB)'}), 413
    file.seek(0)
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported'}), 400
    
    try:
        stream = io.StringIO(file.stream.read().decode('UTF-8'), newline=None)
        csv_reader = csv.DictReader(stream)
        
        entries = []
        errors = []
        row_num = 1
        for row in csv_reader:
            row_num += 1
            try:
                entry = DataEntry(
                    title=row.get('title', f"Data - {row.get('date', '')}"),
                    date=date.fromisoformat(row.get('date', '2020-01-01')) if row.get('date') else datetime.now(timezone.utc).date(),
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
            except (ValueError, TypeError) as e:
                errors.append(f"Row {row_num}: {e!s}")
        
        if entries:
            db.session.add_all(entries)
            db.session.commit()
        
        result = {
            'message': f'Imported {len(entries)} entries',
            'count': len(entries)
        }
        if errors:
            result['errors'] = errors
            result['error_count'] = len(errors)
        
        status = 201 if entries else 400
        return jsonify(result), status
        
    except (ValueError, TypeError, csv.Error, UnicodeDecodeError) as e:
        return jsonify({'error': f'Failed to import CSV: {e}'}), 400


@bp.route('/import/preview', methods=['POST'])
@login_required
def preview_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    file.seek(0, 2)
    if file.tell() > 5 * 1024 * 1024:
        return jsonify({'error': 'File too large (max 5MB)'}), 413
    file.seek(0)
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported'}), 400
    
    try:
        content = file.stream.read().decode('UTF-8')
        from app.services.validation import validate_csv_import
        result = validate_csv_import(content)
        return jsonify(result)
    except UnicodeDecodeError as e:
        return jsonify({'error': f'Failed to read file: {e}'}), 400


@bp.route('/export', methods=['GET'])
@login_required
def export_csv():
    def generate():
        yield 'id,title,date,country,region,confirmed_cases,deaths,recovered,active_cases,population,category_id\n'
        
        entries = DataEntry.query.filter_by(user_id=current_user.id).order_by(DataEntry.date.desc()).yield_per(1000)
        
        for entry in entries:
            row = [
                str(entry.id),
                entry.title,
                entry.date.isoformat() if entry.date else '',
                entry.country or '',
                entry.region or '',
                str(entry.confirmed_cases),
                str(entry.deaths),
                str(entry.recovered),
                str(entry.active_cases),
                str(entry.population),
                str(entry.category_id) if entry.category_id else ''
            ]
            yield ','.join(row) + '\n'
    
    return generate(), 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=data_export.csv'
    }


@bp.route('/countries', methods=['GET'])
@login_required
@cache.memoize(timeout=60)
def get_countries():
    countries = db.session.query(DataEntry.country).filter(
        DataEntry.user_id == current_user.id,
        DataEntry.country.isnot(None)
    ).distinct().all()
    
    return jsonify([c[0] for c in countries if c[0]])
