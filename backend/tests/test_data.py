import io


def test_create_entry(auth_client):
    response = auth_client.post('/api/data', json={
        'title': 'Test Entry',
        'date': '2024-01-15',
        'country': 'USA',
        'metric_a': 100
    })
    assert response.status_code == 201
    assert response.json['title'] == 'Test Entry'


def test_create_entry_invalid_date(auth_client):
    response = auth_client.post('/api/data', json={
        'title': 'Test Entry',
        'date': 'invalid-date'
    })
    assert response.status_code == 400
    assert 'Invalid date' in response.json['error']


def test_create_entry_negative_cases(auth_client):
    response = auth_client.post('/api/data', json={
        'title': 'Test Entry',
        'date': '2024-01-15',
        'metric_a': -100
    })
    assert response.status_code == 400
    assert 'negative' in response.json['error']


def test_get_entries(auth_client):
    auth_client.post('/api/data', json={
        'title': 'Test Entry',
        'date': '2024-01-15'
    })
    response = auth_client.get('/api/data')
    assert response.status_code == 200
    assert 'entries' in response.json
    assert len(response.json['entries']) == 1


def test_get_entry(auth_client):
    create_res = auth_client.post('/api/data', json={
        'title': 'Test Entry',
        'date': '2024-01-15'
    })
    entry_id = create_res.json['id']
    response = auth_client.get(f'/api/data/{entry_id}')
    assert response.status_code == 200
    assert response.json['title'] == 'Test Entry'


def test_update_entry(auth_client):
    create_res = auth_client.post('/api/data', json={
        'title': 'Original',
        'date': '2024-01-15'
    })
    entry_id = create_res.json['id']
    response = auth_client.put(f'/api/data/{entry_id}', json={
        'title': 'Updated'
    })
    assert response.status_code == 200
    assert response.json['title'] == 'Updated'


def test_delete_entry(auth_client):
    create_res = auth_client.post('/api/data', json={
        'title': 'To Delete',
        'date': '2024-01-15'
    })
    entry_id = create_res.json['id']
    response = auth_client.delete(f'/api/data/{entry_id}')
    assert response.status_code == 200
    
    get_res = auth_client.get(f'/api/data/{entry_id}')
    assert get_res.status_code == 404


def test_per_page_limit(auth_client):
    response = auth_client.get('/api/data?per_page=999')
    assert response.status_code == 200


def test_import_csv_valid(auth_client):
    csv_content = b'title,date,country,metric_a\nTest Import,2024-01-15,USA,100\n'
    response = auth_client.post('/api/data/import', 
        data={'file': (io.BytesIO(csv_content), 'test.csv')},
        content_type='multipart/form-data')
    assert response.status_code == 201
    assert response.json['count'] == 1


def test_import_csv_malformed(auth_client):
    csv_content = b'title,date,country\nTest,not-a-date,USA\n'
    response = auth_client.post('/api/data/import',
        data={'file': (io.BytesIO(csv_content), 'test.csv')},
        content_type='multipart/form-data')
    assert response.status_code in [201, 400]


def test_import_csv_empty(auth_client):
    csv_content = b'title,date,country\n'
    response = auth_client.post('/api/data/import',
        data={'file': (io.BytesIO(csv_content), 'test.csv')},
        content_type='multipart/form-data')
    assert response.status_code == 400


def test_import_csv_too_large(auth_client):
    csv_content = b'title,date\n' + b'x' * (6 * 1024 * 1024)
    response = auth_client.post('/api/data/import',
        data={'file': (io.BytesIO(csv_content), 'test.csv')},
        content_type='multipart/form-data')
    assert response.status_code in [400, 413]


def test_import_csv_wrong_extension(auth_client):
    csv_content = b'title,date\nTest,2024-01-15\n'
    response = auth_client.post('/api/data/import',
        data={'file': (io.BytesIO(csv_content), 'test.txt')},
        content_type='multipart/form-data')
    assert response.status_code == 400


def test_export_csv(auth_client):
    auth_client.post('/api/data', json={
        'title': 'Export Test',
        'date': '2024-01-15'
    })
    response = auth_client.get('/api/data/export')
    assert response.status_code == 200
    assert b'Export Test' in response.data
