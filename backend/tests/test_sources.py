import json


class TestSources:
    def test_get_sources_empty(self, auth_client):
        response = auth_client.get('/api/sources')
        assert response.status_code == 200
        assert response.json == []

    def test_create_source(self, auth_client):
        response = auth_client.post('/api/sources', json={
            'name': 'Test API',
            'source_type': 'api',
            'config': {'url': 'https://api.example.com/data'}
        })
        assert response.status_code == 201
        data = response.json
        assert data['name'] == 'Test API'
        assert data['source_type'] == 'api'

    def test_create_source_invalid_type(self, auth_client):
        response = auth_client.post('/api/sources', json={
            'name': 'Bad Source',
            'source_type': 'invalid'
        })
        assert response.status_code == 400

    def test_get_source(self, auth_client):
        auth_client.post('/api/sources', json={
            'name': 'My Source',
            'source_type': 'csv'
        })
        response = auth_client.get('/api/sources/1')
        assert response.status_code == 200
        assert response.json['name'] == 'My Source'

    def test_update_source(self, auth_client):
        auth_client.post('/api/sources', json={
            'name': 'Old Name',
            'source_type': 'api'
        })
        response = auth_client.put('/api/sources/1', json={'name': 'New Name'})
        assert response.status_code == 200
        assert response.json['name'] == 'New Name'

    def test_delete_source(self, auth_client):
        auth_client.post('/api/sources', json={
            'name': 'To Delete',
            'source_type': 'manual'
        })
        response = auth_client.delete('/api/sources/1')
        assert response.status_code == 200

        response = auth_client.get('/api/sources/1')
        assert response.status_code == 404

    def test_sync_webhook_source_fails(self, auth_client):
        auth_client.post('/api/sources', json={
            'name': 'Webhook',
            'source_type': 'webhook'
        })
        response = auth_client.post('/api/sources/1/sync')
        assert response.status_code == 400
        assert 'passive' in response.json['error'].lower()


class TestWebhooks:
    def test_receive_webhook(self, client, db):
        from app.models import DataSource, User
        user = User(email='wh@example.com', username='whuser')
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()

        source = DataSource(
            name='Test Webhook',
            source_type='webhook',
            config_json=json.dumps({'field_mapping': {}}),
            user_id=user.id
        )
        db.session.add(source)
        db.session.commit()

        response = client.post(f'/api/webhooks/{source.id}/receive', json={
            'title': 'Webhook Entry',
            'date': '2025-01-15',
            'confirmed_cases': 100
        })
        assert response.status_code == 200
        assert response.json['received'] == 1

    def test_webhook_missing_signature(self, client, db):
        from app.models import DataSource, User
        user = User(email='wh2@example.com', username='whuser2')
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()

        source = DataSource(
            name='Secured Webhook',
            source_type='webhook',
            config_json=json.dumps({'secret': 'mysecret', 'field_mapping': {}}),
            user_id=user.id
        )
        db.session.add(source)
        db.session.commit()

        response = client.post(f'/api/webhooks/{source.id}/receive', json={
            'title': 'Entry',
            'date': '2025-01-15'
        })
        assert response.status_code == 401
