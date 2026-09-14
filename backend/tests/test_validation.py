from app.services.validation import detect_duplicates, validate_csv_import


def test_validate_csv_valid():
    csv_content = "title,date,confirmed_cases,deaths\nTest,2024-01-15,100,10\n"
    result = validate_csv_import(csv_content)
    assert result['total_rows'] == 1
    assert len(result['valid_rows']) == 1
    assert len(result['errors']) == 0


def test_validate_csv_missing_title():
    csv_content = "title,date,confirmed_cases\n,2024-01-15,100\n"
    result = validate_csv_import(csv_content)
    assert len(result['errors']) == 1
    assert 'Missing title' in result['errors'][0]['errors']


def test_validate_csv_missing_date():
    csv_content = "title,date,confirmed_cases\nTest,,100\n"
    result = validate_csv_import(csv_content)
    assert len(result['errors']) == 1
    assert 'Missing date' in result['errors'][0]['errors']


def test_validate_csv_invalid_date():
    csv_content = "title,date,confirmed_cases\nTest,not-a-date,100\n"
    result = validate_csv_import(csv_content)
    assert len(result['errors']) == 1
    assert 'Invalid date format' in result['errors'][0]['errors'][0]


def test_validate_csv_negative_value():
    csv_content = "title,date,confirmed_cases,deaths\nTest,2024-01-15,100,-5\n"
    result = validate_csv_import(csv_content)
    assert len(result['warnings']) == 1
    assert 'deaths is negative' in result['warnings'][0]['warnings']


def test_validate_csv_non_numeric():
    csv_content = "title,date,confirmed_cases\nTest,2024-01-15,abc\n"
    result = validate_csv_import(csv_content)
    assert len(result['errors']) == 1
    assert 'not a number' in result['errors'][0]['errors'][0]


def test_validate_csv_with_mapping():
    csv_content = "name,d,cases\nTest,2024-01-15,100\n"
    mapping = {'title': 'name', 'date': 'd', 'confirmed_cases': 'cases'}
    result = validate_csv_import(csv_content, field_mapping=mapping)
    assert len(result['valid_rows']) == 1


def test_detect_duplicates():
    class MockEntry:
        def __init__(self, date, country, title):
            self.date = date
            self.country = country
            self.title = title
    
    from datetime import date
    existing = [MockEntry(date(2024, 1, 15), 'USA', 'Entry 1')]
    new = [
        {'date': date(2024, 1, 15), 'country': 'USA', 'title': 'Entry 1'},
        {'date': date(2024, 1, 16), 'country': 'USA', 'title': 'Entry 2'}
    ]
    
    dups = detect_duplicates(existing, new)
    assert dups == [0]
