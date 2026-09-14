def test_summary(auth_client):
    auth_client.post('/api/data', json={
        'title': 'Test',
        'date': '2024-01-15',
        'metric_a': 100,
        'metric_b': 10,
        'metric_c': 80
    })
    with auth_client.session_transaction():
        pass
    response = auth_client.get('/api/analytics/summary')
    assert response.status_code == 200
    assert response.json['total_entries'] == 1
    assert response.json['total_metric_a'] == 100


def test_trends(auth_client):
    auth_client.post('/api/data', json={
        'title': 'Test',
        'date': '2024-01-15',
        'metric_a': 50
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
        'metric_a': 100,
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


def test_growth_rate(auth_client):
    from datetime import datetime, timedelta, timezone
    today = datetime.now(timezone.utc).date()
    auth_client.post('/api/data', json={
        'title': 'Day 1',
        'date': (today - timedelta(days=1)).isoformat(),
        'metric_a': 100
    })
    auth_client.post('/api/data', json={
        'title': 'Day 2',
        'date': today.isoformat(),
        'metric_a': 150
    })
    response = auth_client.get('/api/analytics/growth-rate?days=30')
    assert response.status_code == 200
    assert 'growth_rate' in response.json


def test_forecast(auth_client):
    from datetime import datetime, timedelta, timezone
    today = datetime.now(timezone.utc).date()
    for i in range(5):
        d = today - timedelta(days=10 - i)
        auth_client.post('/api/data', json={
            'title': f'Day {i}',
            'date': d.isoformat(),
            'metric_a': 100 + i * 20
        })
    response = auth_client.get('/api/analytics/forecast?days=30&forecast_days=7')
    assert response.status_code == 200
    assert 'forecast' in response.json
    assert len(response.json['forecast']) == 7


def test_moving_average(auth_client):
    from datetime import datetime, timedelta, timezone
    today = datetime.now(timezone.utc).date()
    for i in range(10):
        d = today - timedelta(days=10 - i)
        auth_client.post('/api/data', json={
            'title': f'Day {i}',
            'date': d.isoformat(),
            'metric_a': 100 + i * 10
        })
    response = auth_client.get('/api/analytics/moving-average?days=30&window=7')
    assert response.status_code == 200
    assert 'moving_average' in response.json


def test_anomalies(auth_client):
    from datetime import datetime, timedelta, timezone
    today = datetime.now(timezone.utc).date()
    auth_client.post('/api/data', json={
        'title': 'Normal',
        'date': (today - timedelta(days=1)).isoformat(),
        'metric_a': 100
    })
    auth_client.post('/api/data', json={
        'title': 'Spike',
        'date': today.isoformat(),
        'metric_a': 10000
    })
    response = auth_client.get('/api/analytics/anomalies?days=30&threshold=2')
    assert response.status_code == 200
    assert 'anomalies' in response.json
