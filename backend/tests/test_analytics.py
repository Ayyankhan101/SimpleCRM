def test_summary(auth_client):
    auth_client.post('/api/data', json={
        'title': 'Test',
        'date': '2024-01-15',
        'confirmed_cases': 100,
        'deaths': 10,
        'recovered': 80
    })
    with auth_client.session_transaction() as sess:
        pass
    response = auth_client.get('/api/analytics/summary')
    assert response.status_code == 200
    assert response.json['total_entries'] == 1
    assert response.json['total_confirmed'] == 100


def test_trends(auth_client):
    auth_client.post('/api/data', json={
        'title': 'Test',
        'date': '2024-01-15',
        'confirmed_cases': 50
    })
    response = auth_client.get('/api/analytics/trends?days=30')
    assert response.status_code == 200
    assert 'trends' in response.json


def test_category_breakdown(auth_client):
    cat_res = auth_client.post('/api/categories', json={'name': 'TestCat'})
    cat_id = cat_res.json['id']
    auth_client.post('/api/data', json={
        'title': 'Test',
        'date': '2024-01-15',
        'confirmed_cases': 100,
        'category_id': cat_id
    })
    response = auth_client.get('/api/analytics/category-breakdown')
    assert response.status_code == 200
    assert len(response.json) >= 1


def test_date_range(auth_client):
    auth_client.post('/api/data', json={
        'title': 'Test',
        'date': '2024-01-15'
    })
    response = auth_client.get('/api/analytics/date-range')
    assert response.status_code == 200
    assert response.json['earliest'] is not None


def test_summary_invalid_date(auth_client):
    response = auth_client.get('/api/analytics/summary?start_date=bad-date')
    assert response.status_code == 400
    assert 'Invalid' in response.json['error']
