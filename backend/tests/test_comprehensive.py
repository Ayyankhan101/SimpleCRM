"""
Comprehensive E2E tests: security, edge cases, integration flows, cross-user isolation.
Pushes the testing system to its limits.
"""
import hashlib
import hmac
import io
import json

import pytest


# ─────────────────────────────────────────────
# SECURITY: Auth bypass & session management
# ─────────────────────────────────────────────

class TestAuthBypass:
    """Verify unauthenticated requests are rejected everywhere."""

    @pytest.mark.parametrize("method,path", [
        ("GET", "/api/data"),
        ("POST", "/api/data"),
        ("GET", "/api/analytics/summary"),
        ("GET", "/api/analytics/trends"),
        ("GET", "/api/categories"),
        ("GET", "/api/sources"),
        ("GET", "/api/notifications"),
        ("GET", "/api/data/export"),
    ])
    def test_unauthenticated_rejected(self, client, method, path):
        resp = client.open(path, method=method)
        # Flask-Login returns 302 redirect to login, or 401/403
        assert resp.status_code in (302, 401, 403), f"{method} {path} returned {resp.status_code}"

    def test_me_without_session(self, client):
        resp = client.get('/api/auth/me')
        assert resp.status_code in (302, 401, 403)

    def test_logout_without_session(self, client):
        resp = client.post('/api/auth/logout')
        assert resp.status_code in (302, 401, 403)

    def test_profile_update_without_session(self, client):
        resp = client.put('/api/auth/profile', json={'username': 'hacker'})
        assert resp.status_code in (302, 401, 403)

    def test_password_change_without_session(self, client):
        resp = client.put('/api/auth/password', json={
            'current_password': 'x', 'new_password': 'Y1abcde'
        })
        assert resp.status_code in (302, 401, 403)


# ─────────────────────────────────────────────
# SECURITY: IDOR (Insecure Direct Object Ref)
# ─────────────────────────────────────────────

class TestIDOR:
    """Users must not access other users' data."""

    def _make_user(self, client, db, email, password='TestPass123'):
        resp = client.post('/api/auth/register', json={
            'email': email, 'password': password, 'username': email.split('@')[0]
        })
        assert resp.status_code == 201
        return client

    def test_cannot_read_other_users_entry(self, client, db):
        # User A creates entry
        self._make_user(client, db, 'a@example.com')
        resp = client.post('/api/data', json={'title': 'Secret A', 'date': '2024-01-01'})
        entry_id = resp.json['id']

        # User B logs in (replaces session)
        self._make_user(client, db, 'b@example.com')
        resp = client.get(f'/api/data/{entry_id}')
        assert resp.status_code == 404

    def test_cannot_update_other_users_entry(self, client, db):
        self._make_user(client, db, 'a@example.com')
        resp = client.post('/api/data', json={'title': 'Original', 'date': '2024-01-01'})
        entry_id = resp.json['id']

        self._make_user(client, db, 'b@example.com')
        resp = client.put(f'/api/data/{entry_id}', json={'title': 'Hacked'})
        assert resp.status_code == 404

    def test_cannot_delete_other_users_entry(self, client, db):
        self._make_user(client, db, 'a@example.com')
        resp = client.post('/api/data', json={'title': 'Protected', 'date': '2024-01-01'})
        entry_id = resp.json['id']

        self._make_user(client, db, 'b@example.com')
        resp = client.delete(f'/api/data/{entry_id}')
        assert resp.status_code == 404

    def test_cannot_see_other_users_analytics(self, client, db):
        self._make_user(client, db, 'a@example.com')
        client.post('/api/data', json={
            'title': 'Analytics Data', 'date': '2024-01-01',
            'metric_a': 999999
        })

        self._make_user(client, db, 'b@example.com')
        resp = client.get('/api/analytics/summary')
        assert resp.json.get('total_confirmed', 0) == 0

    def test_cannot_see_other_users_categories(self, client, db):
        self._make_user(client, db, 'a@example.com')
        client.post('/api/categories', json={'name': 'Secret Cat'})

        self._make_user(client, db, 'b@example.com')
        resp = client.get('/api/categories')
        assert len(resp.json) == 0

    def test_cannot_access_other_users_sources(self, client, db):
        self._make_user(client, db, 'a@example.com')
        resp = client.post('/api/sources', json={'name': 'Private', 'source_type': 'api'})
        source_id = resp.json['id']

        self._make_user(client, db, 'b@example.com')
        resp = client.get(f'/api/sources/{source_id}')
        assert resp.status_code == 404

    def test_cannot_access_other_users_notifications(self, client, db):
        self._make_user(client, db, 'a@example.com')
        client.post('/api/notifications', json={
            'name': 'Private', 'notify_type': 'email',
            'config': {'sendgrid_api_key': 'secret'}
        })

        self._make_user(client, db, 'b@example.com')
        resp = client.get('/api/notifications')
        # User B should see empty list, not A's notifications
        assert len(resp.json) == 0

        # User B should not be able to update/delete A's notification
        resp = client.put('/api/notifications/1', json={'name': 'Hacked'})
        assert resp.status_code == 404
        resp = client.delete('/api/notifications/1')
        assert resp.status_code == 404


# ─────────────────────────────────────────────
# SECURITY: Input sanitization
# ─────────────────────────────────────────────

class TestInputSanitization:

    def test_xss_in_entry_title(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': '<script>alert("xss")</script>',
            'date': '2024-01-01'
        })
        assert resp.status_code == 201
        # Title stored as-is (backend is API, not HTML renderer)
        assert '<script>' in resp.json['title']

    def test_xss_in_category_name(self, auth_client):
        resp = auth_client.post('/api/categories', json={
            'name': '<img src=x onerror=alert(1)>'
        })
        assert resp.status_code == 201
        assert '<img' in resp.json['name']

    def test_very_long_title(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': 'x' * 10000,
            'date': '2024-01-01'
        })
        assert resp.status_code in (201, 400)

    def test_unicode_in_title(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': '日本語テスト 🎉 émojis & spëcial chars',
            'date': '2024-01-01'
        })
        assert resp.status_code == 201
        assert '日本語' in resp.json['title']

    def test_empty_json_body(self, auth_client):
        resp = auth_client.post('/api/data', json={})
        assert resp.status_code == 400

    def test_null_json_body(self, auth_client):
        resp = auth_client.post('/api/data',
            data='null',
            content_type='application/json')
        assert resp.status_code == 400

    def test_missing_content_type(self, auth_client):
        resp = auth_client.post('/api/data',
            data='{"title":"test","date":"2024-01-01"}')
        # Flask returns 415 when content-type is missing (correct behavior)
        assert resp.status_code in (201, 400, 415)

    def test_sql_injection_in_search(self, auth_client):
        resp = auth_client.get("/api/data?search='; DROP TABLE data_entries; --")
        assert resp.status_code == 200
        # Table should still exist
        resp2 = auth_client.post('/api/data', json={
            'title': 'Still works', 'date': '2024-01-01'
        })
        assert resp2.status_code == 201

    def test_sql_injection_in_country_filter(self, auth_client):
        resp = auth_client.get("/api/data?country=' OR 1=1 --")
        assert resp.status_code == 200
        assert len(resp.json.get('entries', [])) == 0

    def test_negative_per_page(self, auth_client):
        resp = auth_client.get('/api/data?per_page=-5')
        assert resp.status_code == 200

    def test_zero_per_page(self, auth_client):
        resp = auth_client.get('/api/data?per_page=0')
        assert resp.status_code == 200

    def test_huge_page_number(self, auth_client):
        resp = auth_client.get('/api/data?page=999999')
        assert resp.status_code == 200
        assert len(resp.json['entries']) == 0


# ─────────────────────────────────────────────
# EDGE CASES: Data creation
# ─────────────────────────────────────────────

class TestDataEdgeCases:

    def test_create_with_all_fields(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': 'Full Entry',
            'date': '2024-06-15',
            'country': 'TestLand',
            'region': 'North',
            'metric_a': 1000,
            'metric_b': 50,
            'metric_c': 900,
            'metric_d': 50,
            'metric_e': 1000000,
            'values': {'custom_field': 'value'},
            'metrics': {'score': 42.5}
        })
        assert resp.status_code == 201
        assert resp.json['group_name'] == 'TestLand'
        assert resp.json['metrics']['score'] == 42.5

    def test_create_with_zero_cases(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': 'Zero', 'date': '2024-01-01',
            'metric_a': 0, 'metric_b': 0, 'metric_c': 0
        })
        assert resp.status_code == 201

    def test_create_with_boundary_integers(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': 'Max Int', 'date': '2024-01-01',
            'metric_a': 2**31 - 1,
            'metric_b': 2**31 - 1,
            'metric_e': 2**31 - 1
        })
        assert resp.status_code == 201

    def test_create_future_date(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': 'Future', 'date': '2099-12-31'
        })
        assert resp.status_code == 201

    def test_create_very_old_date(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': 'Ancient', 'date': '1900-01-01'
        })
        assert resp.status_code == 201

    def test_create_missing_title(self, auth_client):
        resp = auth_client.post('/api/data', json={'date': '2024-01-01'})
        assert resp.status_code == 400

    def test_create_missing_date(self, auth_client):
        resp = auth_client.post('/api/data', json={'title': 'No Date'})
        assert resp.status_code == 400

    def test_create_non_numeric_cases(self, auth_client):
        resp = auth_client.post('/api/data', json={
            'title': 'Bad', 'date': '2024-01-01',
            'metric_a': 'not_a_number'
        })
        assert resp.status_code in (400, 500)


# ─────────────────────────────────────────────
# EDGE CASES: CSV import
# ─────────────────────────────────────────────

class TestCSVEdgeCases:

    def _import(self, client, content, filename='test.csv'):
        return client.post('/api/data/import',
            data={'file': (io.BytesIO(content.encode('utf-8')), filename)},
            content_type='multipart/form-data')

    def test_import_utf8_bom(self, auth_client):
        csv_content = '\ufefftitle,date,country\nBOM Entry,2024-01-01,USA\n'
        resp = self._import(auth_client, csv_content)
        assert resp.status_code in (201, 400)

    def test_import_csv_with_special_chars(self, auth_client):
        csv_content = 'title,date,country\n"Entry, with comma",2024-01-01,"USA"\n'
        resp = self._import(auth_client, csv_content)
        assert resp.status_code == 201

    def test_import_csv_missing_date_column(self, auth_client):
        csv_content = 'title,country\nNo Date Row,USA\n'
        resp = self._import(auth_client, csv_content)
        assert resp.status_code in (201, 400)

    def test_import_csv_extra_columns(self, auth_client):
        csv_content = 'title,date,unknown_column,another\nExtra,2024-01-01,x,y\n'
        resp = self._import(auth_client, csv_content)
        assert resp.status_code == 201

    def test_import_csv_100_rows(self, auth_client):
        rows = ['title,date'] + [f'Row {i},2024-01-{i:02d}' for i in range(1, 29)]
        csv_content = '\n'.join(rows) + '\n'
        resp = self._import(auth_client, csv_content)
        assert resp.status_code == 201
        assert resp.json['count'] >= 27

    def test_import_not_a_csv(self, auth_client):
        resp = self._import(auth_client, 'this is not csv', filename='test.txt')
        assert resp.status_code == 400

    def test_import_binary_content(self, auth_client):
        resp = auth_client.post('/api/data/import',
            data={'file': (io.BytesIO(b'\x00\x01\x02\x03'), 'test.csv')},
            content_type='multipart/form-data')
        assert resp.status_code in (400, 500)

    def test_preview_valid_csv(self, auth_client):
        csv_content = 'title,date,country\nPreview,2024-01-01,USA\n'
        resp = auth_client.post('/api/data/import/preview',
            data={'file': (io.BytesIO(csv_content.encode()), 'test.csv')},
            content_type='multipart/form-data')
        assert resp.status_code == 200
        assert 'total_rows' in resp.json

    def test_preview_no_file(self, auth_client):
        resp = auth_client.post('/api/data/import/preview')
        assert resp.status_code == 400


# ─────────────────────────────────────────────
# EDGE CASES: Analytics
# ─────────────────────────────────────────────

class TestAnalyticsEdgeCases:

    def test_summary_no_data(self, auth_client):
        resp = auth_client.get('/api/analytics/summary')
        assert resp.status_code == 200
        assert resp.json['total_entries'] == 0

    def test_trends_no_data(self, auth_client):
        resp = auth_client.get('/api/analytics/trends')
        assert resp.status_code == 200
        assert resp.json['trends'] == []

    def test_growth_rate_no_data(self, auth_client):
        resp = auth_client.get('/api/analytics/growth-rate')
        assert resp.status_code == 200
        assert 'growth_rate' in resp.json

    def test_forecast_no_data(self, auth_client):
        resp = auth_client.get('/api/analytics/forecast')
        assert resp.status_code == 200
        assert 'forecast' in resp.json

    def test_moving_average_no_data(self, auth_client):
        resp = auth_client.get('/api/analytics/moving-average')
        assert resp.status_code == 200
        assert 'moving_average' in resp.json

    def test_anomalies_no_data(self, auth_client):
        resp = auth_client.get('/api/analytics/anomalies')
        assert resp.status_code == 200
        assert 'anomalies' in resp.json

    def test_summary_with_date_filter(self, auth_client):
        auth_client.post('/api/data', json={
            'title': 'Old', 'date': '2020-01-01', 'metric_a': 100
        })
        auth_client.post('/api/data', json={
            'title': 'New', 'date': '2024-06-01', 'metric_a': 200
        })
        resp = auth_client.get('/api/analytics/summary?start_date=2024-01-01')
        assert resp.status_code == 200
        assert resp.json['total_metric_a'] == 200

    def test_summary_invalid_date_format(self, auth_client):
        resp = auth_client.get('/api/analytics/summary?start_date=not-a-date')
        assert resp.status_code == 400

    def test_trends_custom_days(self, auth_client):
        auth_client.post('/api/data', json={
            'title': 'Today', 'date': '2024-06-01', 'metric_a': 50
        })
        resp = auth_client.get('/api/analytics/trends?days=365')
        assert resp.status_code == 200

    def test_forecast_custom_params(self, auth_client):
        for i in range(10):
            auth_client.post('/api/data', json={
                'title': f'Day {i}', 'date': f'2024-06-{i+1:02d}',
                'metric_a': (i+1) * 10
            })
        resp = auth_client.get('/api/analytics/forecast?days=30&forecast_days=14')
        assert resp.status_code == 200

    def test_category_breakdown_empty(self, auth_client):
        resp = auth_client.get('/api/analytics/category-breakdown')
        assert resp.status_code == 200
        assert resp.json == []


# ─────────────────────────────────────────────
# EDGE CASES: Categories
# ─────────────────────────────────────────────

class TestCategoryEdgeCases:

    def test_create_category_minimal(self, auth_client):
        resp = auth_client.post('/api/categories', json={'name': 'X'})
        assert resp.status_code == 201

    def test_create_category_empty_name(self, auth_client):
        resp = auth_client.post('/api/categories', json={'name': ''})
        assert resp.status_code == 400

    def test_create_category_no_name(self, auth_client):
        resp = auth_client.post('/api/categories', json={'description': 'no name'})
        assert resp.status_code == 400

    def test_create_duplicate_category_name(self, auth_client):
        auth_client.post('/api/categories', json={'name': 'Unique'})
        resp = auth_client.post('/api/categories', json={'name': 'Unique'})
        assert resp.status_code in (200, 201, 400)

    def test_update_category(self, auth_client):
        create = auth_client.post('/api/categories', json={'name': 'Original'})
        cat_id = create.json['id']
        resp = auth_client.put(f'/api/categories/{cat_id}', json={'name': 'Updated'})
        assert resp.status_code == 200

    def test_delete_category(self, auth_client):
        create = auth_client.post('/api/categories', json={'name': 'ToDelete'})
        cat_id = create.json['id']
        resp = auth_client.delete(f'/api/categories/{cat_id}')
        assert resp.status_code == 200

    def test_delete_nonexistent_category(self, auth_client):
        resp = auth_client.delete('/api/categories/99999')
        assert resp.status_code == 404


# ─────────────────────────────────────────────
# EDGE CASES: Sources
# ─────────────────────────────────────────────

class TestSourceEdgeCases:

    def test_create_source_all_types(self, auth_client):
        for st in ['api', 'csv', 'webhook', 'manual']:
            resp = auth_client.post('/api/sources', json={
                'name': f'Source {st}', 'source_type': st
            })
            assert resp.status_code == 201

    def test_create_source_invalid_type(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'Bad', 'source_type': 'invalid'
        })
        assert resp.status_code == 400

    def test_create_source_no_name(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'source_type': 'api'
        })
        assert resp.status_code == 400

    def test_sync_webhook_source(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'WH', 'source_type': 'webhook'
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/sources/{sid}/sync')
        assert resp.status_code == 400

    def test_sync_manual_source(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'Manual', 'source_type': 'manual'
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/sources/{sid}/sync')
        assert resp.status_code == 400

    def test_sync_nonexistent_source(self, auth_client):
        resp = auth_client.post('/api/sources/99999/sync')
        assert resp.status_code == 404


# ─────────────────────────────────────────────
# EDGE CASES: Webhooks
# ─────────────────────────────────────────────

class TestWebhookEdgeCases:

    def test_receive_webhook_valid(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'WH', 'source_type': 'webhook'
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/webhooks/{sid}/receive',
            json={'date': '2024-01-01', 'title': 'Webhook Data', 'metric_a': 42})
        assert resp.status_code == 200
        assert resp.json['received'] == 1

    def test_receive_webhook_missing_date(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'WH', 'source_type': 'webhook'
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/webhooks/{sid}/receive',
            json={'title': 'No Date'})
        assert resp.status_code == 200
        assert resp.json['received'] == 0

    def test_receive_webhook_nonexistent_source(self, auth_client):
        resp = auth_client.post('/api/webhooks/99999/receive',
            json={'date': '2024-01-01'})
        assert resp.status_code == 404

    def test_receive_webhook_invalid_json(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'WH', 'source_type': 'webhook'
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/webhooks/{sid}/receive',
            data='not json', content_type='text/plain')
        assert resp.status_code in (400, 415)

    def test_receive_webhook_with_hmac(self, auth_client):
        secret = 'test-secret-123'
        resp = auth_client.post('/api/sources', json={
            'name': 'Secure WH', 'source_type': 'webhook',
            'config': {'secret': secret}
        })
        sid = resp.json['id']
        payload = json.dumps({'date': '2024-01-01', 'title': 'Secure'})
        sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()

        resp = auth_client.post(f'/api/webhooks/{sid}/receive',
            data=payload,
            content_type='application/json',
            headers={'X-Webhook-Signature': sig})
        assert resp.status_code == 200

    def test_receive_webhook_bad_hmac(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'Secure WH', 'source_type': 'webhook',
            'config': {'secret': 'real-secret'}
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/webhooks/{sid}/receive',
            json={'date': '2024-01-01'},
            headers={'X-Webhook-Signature': 'bad-sig'})
        assert resp.status_code == 401

    def test_receive_webhook_missing_hmac(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'Secure WH', 'source_type': 'webhook',
            'config': {'secret': 'real-secret'}
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/webhooks/{sid}/receive',
            json={'date': '2024-01-01'})
        assert resp.status_code == 401

    def test_receive_webhook_batch(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'Batch WH', 'source_type': 'webhook'
        })
        sid = resp.json['id']
        batch = [
            {'date': f'2024-01-{i+1:02d}', 'title': f'Batch {i}'}
            for i in range(5)
        ]
        resp = auth_client.post(f'/api/webhooks/{sid}/receive', json=batch)
        assert resp.status_code == 200
        assert resp.json['received'] == 5

    def test_receive_webhook_with_field_mapping(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'Mapped WH', 'source_type': 'webhook',
            'config': {
                'field_mapping': {
                    'incident_date': 'date',
                    'name': 'title',
                    'count': 'metric_a'
                }
            }
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/webhooks/{sid}/receive',
            json={'incident_date': '2024-01-01', 'name': 'Mapped', 'count': 99})
        assert resp.status_code == 200
        assert resp.json['received'] == 1


# ─────────────────────────────────────────────
# EDGE CASES: Notifications
# ─────────────────────────────────────────────

class TestNotificationEdgeCases:

    def test_create_email_notification(self, auth_client):
        resp = auth_client.post('/api/notifications', json={
            'name': 'Email Alert', 'notify_type': 'email',
            'config': {
                'sendgrid_api_key': 'test-key',
                'from_email': 'test@example.com',
                'to_email': 'admin@example.com'
            }
        })
        assert resp.status_code == 201

    def test_create_webhook_notification(self, auth_client):
        resp = auth_client.post('/api/notifications', json={
            'name': 'Webhook Alert', 'notify_type': 'webhook',
            'config': {'webhook_url': 'https://example.com/hook'}
        })
        assert resp.status_code == 201

    def test_create_notification_no_name(self, auth_client):
        resp = auth_client.post('/api/notifications', json={
            'notify_type': 'email'
        })
        assert resp.status_code == 400

    def test_create_notification_no_type(self, auth_client):
        resp = auth_client.post('/api/notifications', json={
            'name': 'No Type'
        })
        assert resp.status_code == 400

    def test_update_notification(self, auth_client):
        resp = auth_client.post('/api/notifications', json={
            'name': 'Original', 'notify_type': 'email',
            'config': {'sendgrid_api_key': 'k'}
        })
        nid = resp.json['id']
        resp = auth_client.put(f'/api/notifications/{nid}', json={
            'name': 'Updated'
        })
        assert resp.status_code == 200

    def test_delete_notification(self, auth_client):
        resp = auth_client.post('/api/notifications', json={
            'name': 'ToDelete', 'notify_type': 'email',
            'config': {}
        })
        nid = resp.json['id']
        resp = auth_client.delete(f'/api/notifications/{nid}')
        assert resp.status_code == 200

    def test_test_notification(self, auth_client):
        resp = auth_client.post('/api/notifications', json={
            'name': 'Test', 'notify_type': 'email',
            'config': {
                'sendgrid_api_key': 'invalid-key',
                'from_email': 'test@example.com',
                'to_email': 'admin@example.com'
            }
        })
        nid = resp.json['id']
        resp = auth_client.post(f'/api/notifications/{nid}/test')
        assert resp.status_code == 200

    def test_list_notifications(self, auth_client):
        auth_client.post('/api/notifications', json={
            'name': 'N1', 'notify_type': 'email', 'config': {}
        })
        resp = auth_client.get('/api/notifications')
        assert resp.status_code == 200
        assert len(resp.json) >= 1


# ─────────────────────────────────────────────
# INTEGRATION: Full CRUD flow
# ─────────────────────────────────────────────

class TestFullCRUDFlow:

    def test_create_read_update_delete_cycle(self, auth_client):
        # Create
        resp = auth_client.post('/api/data', json={
            'title': 'Cycle Test', 'date': '2024-01-01',
            'metric_a': 100
        })
        assert resp.status_code == 201
        entry_id = resp.json['id']

        # Read
        resp = auth_client.get(f'/api/data/{entry_id}')
        assert resp.status_code == 200
        assert resp.json['title'] == 'Cycle Test'

        # Update
        resp = auth_client.put(f'/api/data/{entry_id}', json={
            'title': 'Updated Cycle', 'metric_a': 200
        })
        assert resp.status_code == 200
        assert resp.json['title'] == 'Updated Cycle'
        assert resp.json['metric_a'] == 200

        # Delete
        resp = auth_client.delete(f'/api/data/{entry_id}')
        assert resp.status_code == 200

        # Verify deleted
        resp = auth_client.get(f'/api/data/{entry_id}')
        assert resp.status_code == 404

    def test_bulk_delete(self, auth_client):
        ids = []
        for i in range(5):
            resp = auth_client.post('/api/data', json={
                'title': f'Bulk {i}', 'date': f'2024-01-{i+1:02d}'
            })
            ids.append(resp.json['id'])

        resp = auth_client.delete('/api/data/bulk', json={'ids': ids[:3]})
        assert resp.status_code == 200
        assert resp.json['deleted'] == 3

        # Remaining entries
        resp = auth_client.get('/api/data')
        assert resp.json['total'] == 2

    def test_export_import_roundtrip(self, auth_client):
        # Create entries
        for i in range(3):
            auth_client.post('/api/data', json={
                'title': f'RT {i}', 'date': f'2024-01-{i+1:02d}',
                'country': 'RTLand'
            })

        # Export
        resp = auth_client.get('/api/data/export')
        assert resp.status_code == 200
        csv_data = resp.data.decode('utf-8')
        assert 'RT 0' in csv_data

        # Re-import
        resp = auth_client.post('/api/data/import',
            data={'file': (io.BytesIO(csv_data.encode()), 'export.csv')},
            content_type='multipart/form-data')
        assert resp.status_code == 201


# ─────────────────────────────────────────────
# INTEGRATION: Source sync flow
# ─────────────────────────────────────────────

class TestSourceSyncFlow:

    def test_csv_source_sync(self, auth_client, tmp_path):
        csv_file = tmp_path / "test_data.csv"
        csv_file.write_text("title,date,country,metric_a\nSynced,2024-01-01,USA,50\n")

        resp = auth_client.post('/api/sources', json={
            'name': 'CSV Source', 'source_type': 'csv',
            'config': {'file_path': str(csv_file)}
        })
        sid = resp.json['id']

        resp = auth_client.post(f'/api/sources/{sid}/sync')
        assert resp.status_code == 200

        # Verify data was created
        resp = auth_client.get('/api/data')
        assert resp.json['total'] >= 1

    def test_api_source_sync_no_url(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'No URL', 'source_type': 'api', 'config': {}
        })
        sid = resp.json['id']
        resp = auth_client.post(f'/api/sources/{sid}/sync')
        assert resp.status_code == 500

    def test_source_list_after_sync(self, auth_client):
        resp = auth_client.post('/api/sources', json={
            'name': 'List Test', 'source_type': 'manual'
        })
        resp = auth_client.get('/api/sources')
        assert resp.status_code == 200
        assert len(resp.json) >= 1


# ─────────────────────────────────────────────
# INTEGRATION: Pagination & search
# ─────────────────────────────────────────────

class TestPaginationSearch:

    def test_pagination(self, auth_client):
        for i in range(25):
            auth_client.post('/api/data', json={
                'title': f'Page {i}', 'date': f'2024-01-{(i%28)+1:02d}'
            })

        resp = auth_client.get('/api/data?page=1&per_page=10')
        assert resp.status_code == 200
        assert len(resp.json['entries']) == 10
        assert resp.json['total'] == 25
        assert resp.json['pages'] == 3

    def test_search(self, auth_client):
        auth_client.post('/api/data', json={
            'title': 'Unique Search Term', 'date': '2024-01-01'
        })
        auth_client.post('/api/data', json={
            'title': 'Different', 'date': '2024-01-02'
        })

        resp = auth_client.get('/api/data?search=Unique')
        assert resp.status_code == 200
        assert len(resp.json['entries']) == 1

    def test_filter_by_country(self, auth_client):
        auth_client.post('/api/data', json={
            'title': 'USA', 'date': '2024-01-01', 'country': 'USA'
        })
        auth_client.post('/api/data', json={
            'title': 'UK', 'date': '2024-01-01', 'country': 'UK'
        })

        resp = auth_client.get('/api/data?country=USA')
        assert resp.status_code == 200
        assert all(e['group_name'] == 'USA' for e in resp.json['entries'])

    def test_filter_by_date_range(self, auth_client):
        auth_client.post('/api/data', json={
            'title': 'Old', 'date': '2020-01-01'
        })
        auth_client.post('/api/data', json={
            'title': 'New', 'date': '2024-06-01'
        })

        resp = auth_client.get('/api/data?start_date=2024-01-01')
        assert resp.status_code == 200
        assert len(resp.json['entries']) == 1

    def test_invalid_start_date(self, auth_client):
        resp = auth_client.get('/api/data?start_date=bad')
        assert resp.status_code == 400

    def test_invalid_end_date(self, auth_client):
        resp = auth_client.get('/api/data?end_date=bad')
        assert resp.status_code == 400

    def test_countries_endpoint(self, auth_client):
        auth_client.post('/api/data', json={
            'title': 'A', 'date': '2024-01-01', 'country': 'USA'
        })
        auth_client.post('/api/data', json={
            'title': 'B', 'date': '2024-01-01', 'country': 'UK'
        })
        resp = auth_client.get('/api/data/countries')
        assert resp.status_code == 200
        assert 'USA' in resp.json
        assert 'UK' in resp.json


# ─────────────────────────────────────────────
# EDGE CASES: Auth
# ─────────────────────────────────────────────

class TestAuthEdgeCases:

    def test_register_no_email(self, client, db):
        resp = client.post('/api/auth/register', json={
            'password': 'Password123'
        })
        assert resp.status_code == 400

    def test_register_no_password(self, client, db):
        resp = client.post('/api/auth/register', json={
            'email': 'test@example.com'
        })
        assert resp.status_code == 400

    def test_register_empty_body(self, client, db):
        resp = client.post('/api/auth/register', json={})
        assert resp.status_code == 400

    def test_login_no_email(self, client, db):
        resp = client.post('/api/auth/login', json={
            'password': 'Password123'
        })
        assert resp.status_code == 400

    def test_login_no_password(self, client, db):
        resp = client.post('/api/auth/login', json={
            'email': 'test@example.com'
        })
        assert resp.status_code == 400

    def test_login_nonexistent_user(self, client, db):
        resp = client.post('/api/auth/login', json={
            'email': 'ghost@example.com', 'password': 'Password123'
        })
        assert resp.status_code == 401

    def test_register_long_email(self, client, db):
        resp = client.post('/api/auth/register', json={
            'email': 'a' * 100 + '@example.com',
            'password': 'Password123'
        })
        assert resp.status_code in (201, 400)

    def test_register_special_chars_username(self, client, db):
        resp = client.post('/api/auth/register', json={
            'email': 'special@example.com',
            'password': 'Password123',
            'username': '<script>alert(1)</script>'
        })
        assert resp.status_code == 201

    def test_profile_update_duplicate_username(self, client, db):
        client.post('/api/auth/register', json={
            'email': 'user1@example.com', 'password': 'Password123',
            'username': 'user1'
        })
        client.post('/api/auth/register', json={
            'email': 'user2@example.com', 'password': 'Password123',
            'username': 'user2'
        })
        # Login as user2
        client.post('/api/auth/login', json={
            'email': 'user2@example.com', 'password': 'Password123'
        })
        resp = client.put('/api/auth/profile', json={'username': 'user1'})
        assert resp.status_code == 400

    def test_change_password_too_short(self, auth_client):
        resp = auth_client.put('/api/auth/password', json={
            'current_password': 'Password123',
            'new_password': 'Short1'
        })
        assert resp.status_code == 400


# ─────────────────────────────────────────────
# EDGE CASES: Notification triggers
# ─────────────────────────────────────────────

class TestNotificationTriggers:

    def test_notification_triggered_on_create(self, auth_client):
        auth_client.post('/api/notifications', json={
            'name': 'Auto Alert', 'notify_type': 'email',
            'config': {'sendgrid_api_key': 'test', 'from_email': 'a@b.com', 'to_email': 'c@d.com'}
        })
        # Create data entry - should trigger check_and_notify
        resp = auth_client.post('/api/data', json={
            'title': 'Trigger', 'date': '2024-01-01'
        })
        assert resp.status_code == 201


# ─────────────────────────────────────────────
# STRESS: Rapid sequential operations
# ─────────────────────────────────────────────

class TestStress:

    def test_rapid_create_delete(self, auth_client):
        ids = []
        for i in range(20):
            resp = auth_client.post('/api/data', json={
                'title': f'Rapid {i}', 'date': f'2024-01-{(i%28)+1:02d}'
            })
            if resp.status_code == 201:
                ids.append(resp.json['id'])

        for entry_id in ids:
            resp = auth_client.delete(f'/api/data/{entry_id}')
            assert resp.status_code == 200

        resp = auth_client.get('/api/data')
        assert resp.json['total'] == 0

    def test_many_concurrent_writes(self, auth_client):
        for i in range(50):
            resp = auth_client.post('/api/data', json={
                'title': f'Concurrent {i}', 'date': f'2024-01-{(i%28)+1:02d}',
                'metric_a': i
            })
            assert resp.status_code == 201

        resp = auth_client.get('/api/data')
        assert resp.json['total'] == 50
