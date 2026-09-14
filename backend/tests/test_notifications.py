from unittest.mock import MagicMock, patch


def test_create_notification(auth_client):
    response = auth_client.post('/api/notifications', json={
        'name': 'Email Alert',
        'notify_type': 'email',
        'config': {
            'to_email': 'test@example.com',
            'from_email': 'alerts@example.com',
            'sendgrid_api_key': 'test-key'
        }
    })
    assert response.status_code == 201
    assert response.json['name'] == 'Email Alert'


def test_list_notifications(auth_client):
    auth_client.post('/api/notifications', json={
        'name': 'Alert 1',
        'notify_type': 'email',
        'config': {}
    })
    auth_client.post('/api/notifications', json={
        'name': 'Alert 2',
        'notify_type': 'webhook',
        'config': {}
    })
    response = auth_client.get('/api/notifications')
    assert response.status_code == 200
    assert len(response.json) == 2


def test_delete_notification(auth_client):
    res = auth_client.post('/api/notifications', json={
        'name': 'To Delete',
        'notify_type': 'email',
        'config': {}
    })
    nid = res.json['id']
    response = auth_client.delete(f'/api/notifications/{nid}')
    assert response.status_code == 200


def test_send_email_notification(app):
    with app.app_context():
        from app.services.notifications import send_email_notification
        with patch('app.services.notifications.requests') as mock_req:
            mock_resp = MagicMock()
            mock_resp.status_code = 202
            mock_req.post.return_value = mock_resp
            config = MagicMock()
            config.config_json = {
                'sendgrid_api_key': 'test-key',
                'from_email': 'test@example.com',
                'to_email': 'recipient@example.com'
            }
            config.id = 1
            result = send_email_notification(config, 'Test Subject', 'Test body')
            assert result is True
            mock_req.post.assert_called_once()


def test_send_webhook_notification(app):
    with app.app_context():
        from app.services.notifications import send_webhook_notification
        with patch('app.services.notifications.requests') as mock_req:
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            mock_req.post.return_value = mock_resp
            config = MagicMock()
            config.config_json = {
                'webhook_url': 'https://example.com/hook',
                'webhook_secret': 'secret'
            }
            config.id = 1
            result = send_webhook_notification(config, {'event': 'test'})
            assert result is True


def test_send_webhook_missing_url():
    from app.services.notifications import send_webhook_notification
    config = MagicMock()
    config.config_json = {}
    config.id = 1
    result = send_webhook_notification(config, {})
    assert result is False
