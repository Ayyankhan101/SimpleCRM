import json
import logging
from datetime import datetime, timezone

from app.models import DataSource, db
from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

logger = logging.getLogger(__name__)

bp = Blueprint('sources', __name__, url_prefix='/api/sources')


@bp.route('', methods=['GET'])
@login_required
def get_sources():
    sources = DataSource.query.filter_by(user_id=current_user.id).all()
    return jsonify([s.to_dict() for s in sources])


@bp.route('/<int:id>', methods=['GET'])
@login_required
def get_source(id):
    source = DataSource.query.filter_by(id=id, user_id=current_user.id).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404
    return jsonify(source.to_dict())


@bp.route('', methods=['POST'])
@login_required
def create_source():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name', '').strip()
    source_type = data.get('source_type', '').strip()

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    if source_type not in ('api', 'csv', 'webhook', 'manual'):
        return jsonify({'error': 'Invalid source_type'}), 400

    source = DataSource(
        name=name,
        source_type=source_type,
        config_json=json.dumps(data.get('config', {})),
        user_id=current_user.id,
    )
    db.session.add(source)
    db.session.commit()

    return jsonify(source.to_dict()), 201


@bp.route('/<int:id>', methods=['PUT'])
@login_required
def update_source(id):
    source = DataSource.query.filter_by(id=id, user_id=current_user.id).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'name' in data:
        source.name = data['name'].strip()
    if 'config' in data:
        source.config_json = json.dumps(data['config'])
    if 'status' in data:
        source.status = data['status']

    db.session.commit()
    return jsonify(source.to_dict())


@bp.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_source(id):
    source = DataSource.query.filter_by(id=id, user_id=current_user.id).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404

    db.session.delete(source)
    db.session.commit()
    return jsonify({'message': 'Source deleted'})


@bp.route('/<int:id>/sync', methods=['POST'])
@login_required
def sync_source(id):
    source = DataSource.query.filter_by(id=id, user_id=current_user.id).first()
    if not source:
        return jsonify({'error': 'Source not found'}), 404

    try:
        config = source.get_config()

        if source.source_type == 'api':
            _sync_api_source(source, config)
        elif source.source_type == 'csv':
            _sync_csv_source(source, config)
        elif source.source_type == 'webhook':
            return jsonify({'error': 'Webhook sources are passive - they receive data, not sync'}), 400
        else:
            return jsonify({'error': 'Manual sources cannot be synced'}), 400

        source.last_sync_at = datetime.now(timezone.utc)
        source.sync_error = None
        db.session.commit()
        return jsonify(source.to_dict())

    except Exception as e:
        source.sync_error = str(e)
        db.session.commit()
        logger.exception(f"Sync failed for source {id}")
        return jsonify({'error': f'Sync failed: {e!s}'}), 500


def _sync_api_source(source, config):
    import requests

    url = config.get('url')
    if not url:
        raise ValueError("No URL configured")

    headers = config.get('headers', {})
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()

    data = response.json()
    field_mapping = config.get('field_mapping', {})

    if isinstance(data, list):
        entries = data
    elif isinstance(data, dict):
        entries = data.get('data', data.get('results', [data]))
    else:
        raise ValueError("Unexpected API response format")

    from app.models import DataEntry
    count = 0
    for item in entries:
        mapped = {}
        for api_field, db_field in field_mapping.items():
            if api_field in item:
                mapped[db_field] = item[api_field]

        if not mapped.get('date') or not mapped.get('title'):
            continue

        entry = DataEntry(
            title=mapped.get('title', 'API Import'),
            date=mapped.get('date'),
            group_name=mapped.get('group_name') or mapped.get('country'),
            subgroup_name=mapped.get('subgroup_name') or mapped.get('region'),
            metric_a=int(mapped.get('metric_a', 0) or mapped.get('confirmed_cases', 0)),
            metric_b=int(mapped.get('metric_b', 0) or mapped.get('deaths', 0)),
            metric_c=int(mapped.get('metric_c', 0) or mapped.get('recovered', 0)),
            metric_d=int(mapped.get('metric_d', 0) or mapped.get('active_cases', 0)),
            metric_e=int(mapped.get('metric_e', 0) or mapped.get('population', 0)),
            source_id=source.id,
            source_type='api',
            user_id=source.user_id,
        )
        db.session.add(entry)
        count += 1

    logger.info(f"Synced {count} entries from API source {source.id}")


def _sync_csv_source(source, config):
    import csv
    from datetime import date as date_type

    file_path = config.get('file_path')
    if not file_path:
        raise ValueError("No file path configured")

    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        from app.models import DataEntry
        count = 0
        for row in reader:
            raw_date = row.get('date', '')
            try:
                entry_date = date_type.fromisoformat(raw_date) if raw_date else date_type.today()
            except (ValueError, TypeError):
                entry_date = date_type.today()

            entry = DataEntry(
                title=row.get('title', 'CSV Import'),
                date=entry_date,
                group_name=row.get('group_name') or row.get('country'),
                subgroup_name=row.get('subgroup_name') or row.get('region'),
                metric_a=int(row.get('metric_a', 0) or row.get('confirmed_cases', 0)),
                metric_b=int(row.get('metric_b', 0) or row.get('deaths', 0)),
                metric_c=int(row.get('metric_c', 0) or row.get('recovered', 0)),
                metric_d=int(row.get('metric_d', 0) or row.get('active_cases', 0)),
                metric_e=int(row.get('metric_e', 0) or row.get('population', 0)),
                source_id=source.id,
                source_type='csv',
                user_id=source.user_id,
            )
            db.session.add(entry)
            count += 1

    logger.info(f"Synced {count} entries from CSV source {source.id}")
