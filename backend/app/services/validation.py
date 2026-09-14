import csv
import io
from datetime import date


def validate_csv_import(file_content, field_mapping=None):
    results = {
        'valid_rows': [],
        'errors': [],
        'warnings': [],
        'total_rows': 0
    }
    
    try:
        reader = csv.DictReader(io.StringIO(file_content))
    except Exception as e:
        results['errors'].append(f'Failed to parse CSV: {e!s}')
        return results
    
    if not reader.fieldnames:
        results['errors'].append('CSV has no headers')
        return results
    
    mapping = field_mapping or {}
    
    for i, row in enumerate(reader, start=2):
        results['total_rows'] += 1
        row_errors = []
        row_warnings = []
        
        title = row.get(mapping.get('title', 'title'), '')
        date_str = row.get(mapping.get('date', 'date'), '')
        
        if not title:
            row_errors.append('Missing title')
        
        if not date_str:
            row_errors.append('Missing date')
        else:
            try:
                date.fromisoformat(date_str)
            except ValueError:
                row_errors.append(f'Invalid date format: {date_str}')
        
        for field in ['confirmed_cases', 'deaths', 'recovered', 'active_cases', 'population']:
            db_field = mapping.get(field, field)
            val = row.get(db_field, '0')
            try:
                num = int(val)
                if num < 0:
                    row_warnings.append(f'{field} is negative')
            except ValueError:
                row_errors.append(f'{field} is not a number: {val}')
        
        if row_errors:
            results['errors'].append({'row': i, 'errors': row_errors})
        else:
            results['valid_rows'].append(row)
        
        if row_warnings:
            results['warnings'].append({'row': i, 'warnings': row_warnings})
    
    return results


def detect_duplicates(existing_entries, new_entries, key_fields=None):
    keys = key_fields or ['date', 'country', 'title']
    
    existing_keys = set()
    for entry in existing_entries:
        key = tuple(getattr(entry, f, None) for f in keys)
        existing_keys.add(key)
    
    duplicates = []
    for i, entry in enumerate(new_entries):
        key = tuple(entry.get(f) for f in keys)
        if key in existing_keys:
            duplicates.append(i)
        else:
            existing_keys.add(key)
    
    return duplicates
