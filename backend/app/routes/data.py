import csv
import io
import json
import logging
from datetime import date, datetime, timezone

from app import cache, limiter
from app.models import Category, DataEntry, db
from app.services.security import sanitize_dict, sanitize_string
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
    group_name = request.args.get('group_name') or request.args.get('country')
    subgroup_name = request.args.get('subgroup_name') or request.args.get('region')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search')

    query = DataEntry.query.filter_by(user_id=current_user.id)

    if category_id:
        query = query.filter_by(category_id=category_id)

    if group_name:
        query = query.filter_by(group_name=group_name)

    if subgroup_name:
        query = query.filter_by(subgroup_name=subgroup_name)

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
@limiter.limit("30/minute")
def create_entry():
    data = request.get_json()

    if not data or not data.get('title') or not data.get('date'):
        return jsonify({'error': 'Title and date are required'}), 400

    data = sanitize_dict(data)

    try:
        entry_date = date.fromisoformat(data['date'])
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Support both old field names and new generic metric fields
    metric_a = data.get('metric_a') or data.get('confirmed_cases', 0)
    metric_b = data.get('metric_b') or data.get('deaths', 0)
    metric_c = data.get('metric_c') or data.get('recovered', 0)

    if not isinstance(metric_a, (int, float)) or \
       not isinstance(metric_b, (int, float)) or \
       not isinstance(metric_c, (int, float)):
        return jsonify({'error': 'Metrics must be numeric'}), 400

    if metric_a < 0 or metric_b < 0 or metric_c < 0:
        return jsonify({'error': 'Metrics cannot be negative'}), 400

    if data.get('category_id'):
        category = Category.query.filter_by(id=data['category_id'], user_id=current_user.id).first()
        if not category:
            return jsonify({'error': 'Category not found'}), 400

    try:
        entry = DataEntry(
            title=data['title'],
            date=entry_date,
            group_name=data.get('group_name') or data.get('country'),
            subgroup_name=data.get('subgroup_name') or data.get('region'),
            metric_a=metric_a,
            metric_b=metric_b,
            metric_c=metric_c,
            metric_d=data.get('metric_d') or data.get('active_cases', 0),
            metric_e=data.get('metric_e') or data.get('population', 0),
            values_json=json.dumps(data.get('values', {})) if data.get('values') else None,
            metrics_json=json.dumps(data.get('metrics', {})) if data.get('metrics') else None,
            source_id=data.get('source_id'),
            source_type=data.get('source_type', 'manual'),
            category_id=data.get('category_id'),
            user_id=current_user.id
        )

        db.session.add(entry)
        db.session.commit()

        from app.services.notifications import check_and_notify
        check_and_notify(current_user.id)

        return jsonify(entry.to_dict()), 201
    except Exception:
        db.session.rollback()
        logger.exception("Failed to create entry")
        return jsonify({'error': 'Failed to create entry'}), 500


@bp.route('/<int:id>', methods=['PUT'])
@login_required
@limiter.limit("30/minute")
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
        if 'group_name' in data or 'country' in data:
            entry.group_name = data.get('group_name') or data.get('country')
        if 'subgroup_name' in data or 'region' in data:
            entry.subgroup_name = data.get('subgroup_name') or data.get('region')

        # Support both old and new metric field names
        for old_name, new_name in [
            ('confirmed_cases', 'metric_a'),
            ('deaths', 'metric_b'),
            ('recovered', 'metric_c'),
            ('active_cases', 'metric_d'),
            ('population', 'metric_e'),
        ]:
            if new_name in data:
                if data[new_name] < 0:
                    return jsonify({'error': f'{new_name} cannot be negative'}), 400
                setattr(entry, new_name, data[new_name])
            elif old_name in data:
                if data[old_name] < 0:
                    return jsonify({'error': f'{old_name} cannot be negative'}), 400
                setattr(entry, new_name, data[old_name])

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
@limiter.limit("20/minute")
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
@limiter.limit("10/minute")
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
@limiter.limit("5/minute")
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
                    group_name=row.get('group_name') or row.get('country'),
                    subgroup_name=row.get('subgroup_name') or row.get('region'),
                    metric_a=int(row.get('metric_a', 0) or row.get('confirmed_cases', 0)) if (row.get('metric_a') or row.get('confirmed_cases')) else 0,
                    metric_b=int(row.get('metric_b', 0) or row.get('deaths', 0)) if (row.get('metric_b') or row.get('deaths')) else 0,
                    metric_c=int(row.get('metric_c', 0) or row.get('recovered', 0)) if (row.get('metric_c') or row.get('recovered')) else 0,
                    metric_d=int(row.get('metric_d', 0) or row.get('active_cases', 0)) if (row.get('metric_d') or row.get('active_cases')) else 0,
                    metric_e=int(row.get('metric_e', 0) or row.get('population', 0)) if (row.get('metric_e') or row.get('population')) else 0,
                    category_id=int(row.get('category_id')) if row.get('category_id') else None,
                    user_id=current_user.id
                )
                entries.append(entry)
            except (ValueError, TypeError) as e:
                errors.append(f"Row {row_num}: {e!s}")

        if entries:
            db.session.add_all(entries)
            db.session.commit()
            from app.services.notifications import check_and_notify
            check_and_notify(current_user.id)

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
        yield 'id,title,date,group_name,subgroup_name,metric_a,metric_b,metric_c,metric_d,metric_e,category_id\n'

        entries = DataEntry.query.filter_by(user_id=current_user.id).order_by(DataEntry.date.desc()).yield_per(1000)

        for entry in entries:
            row = [
                str(entry.id),
                entry.title,
                entry.date.isoformat() if entry.date else '',
                entry.group_name or '',
                entry.subgroup_name or '',
                str(entry.metric_a),
                str(entry.metric_b),
                str(entry.metric_c),
                str(entry.metric_d),
                str(entry.metric_e),
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
    groups = db.session.query(DataEntry.group_name).filter(
        DataEntry.user_id == current_user.id,
        DataEntry.group_name.isnot(None)
    ).distinct().all()

    return jsonify([g[0] for g in groups if g[0]])
