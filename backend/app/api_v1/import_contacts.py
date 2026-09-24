import csv
import io
from flask import request, jsonify
from flask_login import current_user, login_required
from app.models import Contact, db
from app.api_v1 import contacts_blp, _stats_cache

ALLOWED_COLUMNS = {
    'first_name', 'last_name', 'email', 'phone', 'company',
    'role', 'stage', 'score', 'notes'
}

STAGE_VALUES = {'lead', 'prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'}

FIELD_MAP = {
    'name': 'first_name',
    'first name': 'first_name',
    'firstname': 'first_name',
    'last name': 'last_name',
    'lastname': 'last_name',
    'company name': 'company',
    'organization': 'company',
    'job title': 'role',
    'title': 'role',
    'position': 'role',
}

MAX_ROWS = 1000


def normalize_header(header):
    h = header.strip().lower().replace(' ', '_').replace('-', '_')
    if h in ALLOWED_COLUMNS:
        return h
    if h in FIELD_MAP:
        return FIELD_MAP[h]
    return None


def parse_csv(file_content):
    if isinstance(file_content, bytes):
        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                file_content = file_content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue

    reader = csv.DictReader(io.StringIO(file_content))

    if not reader.fieldnames:
        return None, None, ["No headers found in CSV"]

    header_map = {}
    unmapped = []
    for original in reader.fieldnames:
        normalized = normalize_header(original)
        if normalized:
            header_map[original] = normalized
        else:
            unmapped.append(original)

    rows = []
    for row in reader:
        mapped = {}
        for original_key, value in row.items():
            if original_key in header_map:
                mapped[header_map[original_key]] = value.strip() if value else ''

        if 'name' in mapped and 'first_name' not in mapped:
            parts = mapped.pop('name').strip().split(' ', 1)
            mapped['first_name'] = parts[0] if parts else ''
            mapped['last_name'] = parts[1] if len(parts) > 1 else ''

        rows.append(mapped)

    return list(header_map.values()), rows, unmapped


def validate_row(row, row_num):
    errors = []
    warnings = []
    cleaned = {}

    first = row.get('first_name', '').strip()
    if not first:
        errors.append(f"Row {row_num}: first_name is required")
    elif len(first) > 100:
        errors.append(f"Row {row_num}: first_name too long (max 100)")
    cleaned['first_name'] = first

    last = row.get('last_name', '').strip()
    if last and len(last) > 100:
        errors.append(f"Row {row_num}: last_name too long (max 100)")
    cleaned['last_name'] = last or None

    email = row.get('email', '').strip()
    if email:
        if '@' not in email or '.' not in email.split('@')[-1]:
            warnings.append(f"Row {row_num}: invalid email format")
        cleaned['email'] = email
    else:
        cleaned['email'] = None

    cleaned['phone'] = row.get('phone', '').strip() or None
    cleaned['company'] = row.get('company', '').strip() or None
    cleaned['role'] = row.get('role', '').strip() or None

    stage = row.get('stage', '').strip().lower()
    if stage and stage not in STAGE_VALUES:
        warnings.append(f"Row {row_num}: invalid stage '{stage}', using 'lead'")
        stage = 'lead'
    cleaned['stage'] = stage or 'lead'

    score_str = row.get('score', '0').strip()
    try:
        score = int(float(score_str)) if score_str else 0
        score = max(0, min(100, score))
    except ValueError:
        warnings.append(f"Row {row_num}: invalid score '{score_str}', using 0")
        score = 0
    cleaned['score'] = score

    cleaned['notes'] = row.get('notes', '').strip() or None

    return cleaned, errors, warnings


@contacts_blp.route('/import/preview', methods=['POST'])
@contacts_blp.doc(security=[{'Bearer': []}])
@login_required
def preview_import():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'File must be a .csv file'}), 400

    content = file.read()
    if len(content) > 10 * 1024 * 1024:
        return jsonify({'error': 'File too large (max 10MB)'}), 400

    headers, rows, unmapped = parse_csv(content)
    if not headers:
        return jsonify({'error': 'Could not parse CSV'}), 400

    if not rows:
        return jsonify({'error': 'CSV is empty'}), 400

    if len(rows) > MAX_ROWS:
        return jsonify({'error': f'Too many rows (max {MAX_ROWS}, found {len(rows)})'}), 400

    valid_rows = []
    all_errors = []
    all_warnings = []

    for i, row in enumerate(rows):
        cleaned, errors, warnings = validate_row(row, i + 2)
        all_errors.extend(errors)
        all_warnings.extend(warnings)
        if not errors:
            valid_rows.append(cleaned)

    return jsonify({
        'total_rows': len(rows),
        'valid_rows': valid_rows,
        'error_count': len(all_errors),
        'errors': all_errors[:20],
        'warnings': all_warnings[:10],
        'unmapped_columns': unmapped,
        'preview': valid_rows[:5],
    })


@contacts_blp.route('/import', methods=['POST'])
@contacts_blp.doc(security=[{'Bearer': []}])
@login_required
def execute_import():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if not file.filename or not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'Invalid file'}), 400

    content = file.read()
    headers, rows, _ = parse_csv(content)

    if not rows:
        return jsonify({'error': 'CSV is empty'}), 400

    if len(rows) > MAX_ROWS:
        return jsonify({'error': f'Too many rows (max {MAX_ROWS})'}), 400

    created = 0
    skipped = 0

    for i, row in enumerate(rows):
        cleaned, row_errors, _ = validate_row(row, i + 2)
        if row_errors:
            skipped += 1
            continue

        if cleaned.get('email'):
            existing = Contact.query.filter_by(
                email=cleaned['email'],
                owner_id=current_user.id,
                deleted_at=None
            ).first()
            if existing:
                skipped += 1
                continue

        contact = Contact(
            first_name=cleaned['first_name'],
            last_name=cleaned.get('last_name'),
            email=cleaned.get('email'),
            phone=cleaned.get('phone'),
            company=cleaned.get('company'),
            role=cleaned.get('role'),
            stage=cleaned.get('stage', 'lead'),
            score=cleaned.get('score', 0),
            notes=cleaned.get('notes'),
            owner_id=current_user.id,
            org_id=current_user.org_id,
        )
        db.session.add(contact)
        created += 1

    if created > 0:
        db.session.commit()
        _stats_cache.invalidate()

    return jsonify({
        'message': f'Import complete: {created} created, {skipped} skipped',
        'created': created,
        'skipped': skipped,
    })
