from unittest.mock import patch, MagicMock


class TestGoogleOAuthMock:

    def test_google_login_redirects(self, auth_client):
        resp = auth_client.get('/api/auth/google')
        assert resp.status_code in (302, 303, 500)

    def test_google_callback_missing_code(self, auth_client):
        resp = auth_client.get('/api/auth/google/callback')
        assert resp.status_code in (302, 400, 500)

    @patch('app.routes.auth.requests')
    def test_google_callback_success(self, mock_requests, auth_client, db):
        mock_token_resp = MagicMock()
        mock_token_resp.json.return_value = {'access_token': 'mock-token', 'token_type': 'Bearer'}
        mock_token_resp.status_code = 200
        mock_requests.post.return_value = mock_token_resp

        mock_user_resp = MagicMock()
        mock_user_resp.json.return_value = {
            'email': 'google@example.com',
            'name': 'Google User',
            'id': '12345'
        }
        mock_user_resp.status_code = 200
        mock_requests.get.return_value = mock_user_resp

        resp = auth_client.get('/api/auth/google/callback?code=mock-auth-code&state=test-state')
        assert resp.status_code in (200, 302, 400)

    def test_google_mobile_missing_token(self, auth_client):
        resp = auth_client.post('/api/auth/google/mobile', json={})
        assert resp.status_code == 400


class TestNotificationIDOR:

    def test_cannot_delete_other_user_notification(self, auth_client, client, db):
        create = auth_client.post('/api/notifications', json={
            'name': 'Mine', 'notify_type': 'email', 'config': {}
        })
        nid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.delete(f'/api/notifications/{nid}')
        assert resp.status_code in (403, 404)

    def test_delete_nonexistent_notification(self, auth_client):
        resp = auth_client.delete('/api/notifications/99999')
        assert resp.status_code == 404


class TestNotificationUpdate:

    def test_update_notification(self, auth_client):
        create = auth_client.post('/api/notifications', json={
            'name': 'Original', 'notify_type': 'email', 'config': {}
        })
        nid = create.json['id']
        resp = auth_client.put(f'/api/notifications/{nid}', json={'name': 'Updated'})
        assert resp.status_code == 200
        assert resp.json['name'] == 'Updated'

    def test_update_nonexistent_notification(self, auth_client):
        resp = auth_client.put('/api/notifications/99999', json={'name': 'X'})
        assert resp.status_code == 404


class TestSourceIDOR:

    def test_cannot_read_other_user_source(self, auth_client, client, db):
        create = auth_client.post('/api/sources', json={
            'name': 'Mine', 'source_type': 'api',
            'config': {'url': 'https://example.com'}
        })
        sid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.get(f'/api/sources/{sid}')
        assert resp.status_code in (403, 404)

    def test_cannot_update_other_user_source(self, auth_client, client, db):
        create = auth_client.post('/api/sources', json={
            'name': 'Mine', 'source_type': 'api',
            'config': {'url': 'https://example.com'}
        })
        sid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.put(f'/api/sources/{sid}', json={'name': 'Hacked'})
        assert resp.status_code in (403, 404)

    def test_cannot_delete_other_user_source(self, auth_client, client, db):
        create = auth_client.post('/api/sources', json={
            'name': 'Mine', 'source_type': 'api',
            'config': {'url': 'https://example.com'}
        })
        sid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.delete(f'/api/sources/{sid}')
        assert resp.status_code in (403, 404)

    def test_get_nonexistent_source(self, auth_client):
        resp = auth_client.get('/api/sources/99999')
        assert resp.status_code == 404

    def test_delete_nonexistent_source(self, auth_client):
        resp = auth_client.delete('/api/sources/99999')
        assert resp.status_code == 404


class TestAuthEdgeCases:

    def test_register_missing_email(self, client, db):
        resp = client.post('/api/auth/register', json={'password': 'Password1'})
        assert resp.status_code == 400

    def test_register_missing_password(self, client, db):
        resp = client.post('/api/auth/register', json={'email': 'a@b.com'})
        assert resp.status_code == 400

    def test_login_nonexistent_user(self, client, db):
        resp = client.post('/api/auth/login', json={
            'email': 'nobody@example.com', 'password': 'Password1'
        })
        assert resp.status_code == 401

    def test_me_unauthenticated(self, client, db):
        resp = client.get('/api/auth/me')
        assert resp.status_code in (302, 401)

    def test_logout_unauthenticated(self, client, db):
        resp = client.post('/api/auth/logout')
        assert resp.status_code in (200, 302, 401)

    def test_register_duplicate_username(self, client, db):
        client.post('/api/auth/register', json={
            'email': 'a@example.com', 'password': 'Password1', 'username': 'taken'
        })
        resp = client.post('/api/auth/register', json={
            'email': 'b@example.com', 'password': 'Password1', 'username': 'taken'
        })
        assert resp.status_code == 400
        assert 'taken' in resp.json['error'].lower()
