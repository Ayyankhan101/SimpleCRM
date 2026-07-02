def test_create_entry(auth_client):
    response = auth_client.post('/api/data', json={
        'title': 'Test Entry',
        'date': '2024-01-15',
        'country': 'USA',
        'confirmed_cases': 100
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
        'confirmed_cases': -100
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
