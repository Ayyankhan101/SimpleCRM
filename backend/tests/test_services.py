import time
from datetime import date, datetime, timezone
from types import SimpleNamespace

from app.services.analytics import (calc_growth_rate, calc_moving_average,
                                     detect_anomalies, forecast_trend)
from app.services.security import (enforce_https, sanitize_dict, sanitize_html,
                                    sanitize_string)
from app.services.rbac import log_audit, require_role


class TestAnalyticsPure:

    def _entry(self, dt, val):
        return SimpleNamespace(date=date.fromisoformat(dt) if dt else None, metric_a=val)

    def test_growth_rate_empty(self):
        assert calc_growth_rate([]) == []

    def test_growth_rate_single(self):
        assert calc_growth_rate([self._entry('2024-01-01', 100)]) == []

    def test_growth_rate_basic(self):
        entries = [self._entry('2024-01-01', 100), self._entry('2024-01-02', 150)]
        result = calc_growth_rate(entries)
        assert len(result) == 1
        assert result[0]['growth_rate'] == 50.0

    def test_growth_rate_zero_prev(self):
        entries = [self._entry('2024-01-01', 0), self._entry('2024-01-02', 100)]
        result = calc_growth_rate(entries)
        assert result[0]['growth_rate'] == 0

    def test_growth_rate_negative(self):
        entries = [self._entry('2024-01-01', 200), self._entry('2024-01-02', 100)]
        result = calc_growth_rate(entries)
        assert result[0]['growth_rate'] == -50.0

    def test_growth_rate_same_values(self):
        entries = [self._entry('2024-01-01', 100), self._entry('2024-01-02', 100)]
        result = calc_growth_rate(entries)
        assert result[0]['growth_rate'] == 0

    def test_moving_average_empty(self):
        assert calc_moving_average([]) == []

    def test_moving_average_insufficient(self):
        entries = [self._entry(f'2024-01-0{i}', 100) for i in range(1, 5)]
        assert calc_moving_average(entries, window=7) == []

    def test_moving_average_exact_window(self):
        entries = [self._entry(f'2024-01-0{i}', i * 10) for i in range(1, 8)]
        result = calc_moving_average(entries, window=7)
        assert len(result) == 1
        assert result[0]['moving_avg'] == 40.0

    def test_moving_average_beyond_window(self):
        entries = [self._entry(f'2024-01-0{i}', 100) for i in range(1, 10)]
        result = calc_moving_average(entries, window=7)
        assert len(result) == 3
        assert all(r['moving_avg'] == 100.0 for r in result)

    def test_forecast_insufficient(self):
        assert forecast_trend([self._entry('2024-01-01', 100)]) == []

    def test_forecast_basic(self):
        entries = [
            self._entry('2024-01-01', 100),
            self._entry('2024-01-02', 200),
            self._entry('2024-01-03', 300),
        ]
        result = forecast_trend(entries, days_ahead=3)
        assert len(result) == 3
        assert all('date' in r and 'predicted' in r for r in result)
        assert all(r['predicted'] >= 0 for r in result)

    def test_forecast_flat_line(self):
        entries = [self._entry(f'2024-01-0{i}', 100) for i in range(1, 5)]
        result = forecast_trend(entries, days_ahead=3)
        assert len(result) == 3
        for r in result:
            assert r['predicted'] == 100

    def test_forecast_single_point(self):
        entries = [self._entry('2024-01-01', 50)]
        result = forecast_trend(entries)
        assert result == []

    def test_anomalies_insufficient(self):
        assert detect_anomalies([self._entry('2024-01-01', 100)]) == []

    def test_anomalies_none_found(self):
        entries = [self._entry(f'2024-01-0{i}', 100) for i in range(1, 6)]
        result = detect_anomalies(entries)
        assert result == []

    def test_anomalies_found(self):
        entries = [
            self._entry('2024-01-01', 100),
            self._entry('2024-01-02', 100),
            self._entry('2024-01-03', 100),
            self._entry('2024-01-04', 100),
            self._entry('2024-01-05', 1000),
        ]
        result = detect_anomalies(entries, threshold=1.9)
        assert len(result) == 1
        assert result[0]['value'] == 1000
        assert result[0]['z_score'] > 1.9

    def test_anomalies_std_dev_zero(self):
        entries = [self._entry(f'2024-01-0{i}', 50) for i in range(1, 5)]
        result = detect_anomalies(entries)
        assert result == []


class TestSecurityService:

    def test_sanitize_html_strips_script(self):
        result = sanitize_html('<script>alert(1)</script>')
        assert '<script>' not in result
        assert 'alert' in result

    def test_sanitize_html_allows_safe_tags(self):
        result = sanitize_html('<b>bold</b> <i>italic</i>')
        assert '<b>' in result
        assert '<i>' in result

    def test_sanitize_html_strips_img(self):
        result = sanitize_html('<img src=x onerror=alert(1)>')
        assert '<img' not in result

    def test_sanitize_html_none(self):
        assert sanitize_html(None) is None

    def test_sanitize_html_empty(self):
        assert sanitize_html('') == ''

    def test_sanitize_string_strips(self):
        result = sanitize_string('  <script>x</script>  ')
        assert '<script>' not in result

    def test_sanitize_string_non_string(self):
        assert sanitize_string(123) == 123
        assert sanitize_string(None) is None

    def test_sanitize_dict(self):
        result = sanitize_dict({'name': '<b>test</b>', 'value': 42})
        assert '<b>' in result['name']
        assert result['value'] == 42

    def test_sanitize_dict_non_dict(self):
        assert sanitize_dict('hello') == 'hello'

    def test_enforce_https_redirects(self):
        from flask import Flask
        test_app = Flask(__name__)
        test_app.config['SECRET_KEY'] = 'test'

        @test_app.route('/api/health')
        def health():
            return 'ok'

        enforce_https(test_app)
        with test_app.test_client() as client:
            resp = client.get('/api/health')
            assert resp.status_code == 301

    def test_enforce_https_with_header(self):
        from flask import Flask
        test_app = Flask(__name__)
        test_app.config['SECRET_KEY'] = 'test'

        @test_app.route('/api/health')
        def health():
            return 'ok'

        enforce_https(test_app)
        with test_app.test_client() as client:
            resp = client.get('/api/health', headers={'X-Forwarded-Proto': 'https'})
            assert resp.status_code == 200


class TestRBACService:

    def test_log_audit_creates_entry(self, auth_client, db):
        from app.models import User
        with auth_client.application.app_context():
            user = User.query.filter_by(email='test@example.com').first()
            from flask_login import login_user
            login_user(user)
            log_audit('create', 'contact', 1, {'name': 'test'})
            from app.models import AuditLog
            entry = AuditLog.query.first()
            assert entry is not None
            assert entry.action == 'create'
            assert entry.entity_type == 'contact'
            assert entry.entity_id == 1

    def test_log_audit_unauthenticated(self, auth_client, db):
        from flask_login import logout_user
        with auth_client.application.app_context():
            logout_user()
            log_audit('create', 'contact')
            from app.models import AuditLog
            assert AuditLog.query.count() == 0

    def test_require_role_allowed(self):
        from app.services.rbac import require_role
        from flask import Flask
        from flask_login import LoginManager, UserMixin

        test_app = Flask(__name__)
        test_app.config['SECRET_KEY'] = 'test'

        class MockUser(UserMixin):
            id = 1
            role = 'member'

        login_manager = LoginManager()
        login_manager.init_app(test_app)
        user = MockUser()

        @login_manager.user_loader
        def load_user(user_id):
            return user

        @test_app.route('/login-test')
        def login_test():
            from flask_login import login_user
            login_user(user)
            return 'logged in'

        @test_app.route('/test-role')
        @require_role('member', 'admin')
        def test_route():
            return 'ok'

        with test_app.test_client() as client:
            client.get('/login-test')
            resp = client.get('/test-role')
            assert resp.status_code == 200

    def test_require_role_forbidden(self):
        from app.services.rbac import require_role
        from flask import Flask
        from flask_login import LoginManager, UserMixin

        test_app = Flask(__name__)
        test_app.config['SECRET_KEY'] = 'test'

        class MockUser(UserMixin):
            id = 2
            role = 'member'

        login_manager = LoginManager()
        login_manager.init_app(test_app)
        user = MockUser()

        @login_manager.user_loader
        def load_user(user_id):
            return user

        @test_app.route('/login-test')
        def login_test():
            from flask_login import login_user
            login_user(user)
            return 'logged in'

        @test_app.route('/test-admin-role')
        @require_role('admin')
        def admin_route():
            return 'ok'

        with test_app.test_client() as client:
            client.get('/login-test')
            resp = client.get('/test-admin-role')
            assert resp.status_code == 403


class TestHealthEndpoint:

    def test_health_returns_200(self, client):
        resp = client.get('/api/health')
        assert resp.status_code == 200

    def test_health_has_status(self, client):
        resp = client.get('/api/health')
        assert resp.json['status'] in ('healthy', 'degraded')

    def test_health_has_checks(self, client):
        resp = client.get('/api/health')
        assert 'checks' in resp.json
        assert 'database' in resp.json['checks']
        assert 'data' in resp.json['checks']

    def test_health_database_healthy(self, client):
        resp = client.get('/api/health')
        assert resp.json['checks']['database']['status'] == 'healthy'
        assert 'latency_ms' in resp.json['checks']['database']

    def test_health_data_stats(self, client):
        resp = client.get('/api/health')
        data = resp.json['checks']['data']
        assert 'entries' in data
        assert 'users' in data

    def test_health_has_version(self, client):
        resp = client.get('/api/health')
        assert 'version' in resp.json

    def test_health_has_timestamp(self, client):
        resp = client.get('/api/health')
        assert 'timestamp' in resp.json


class TestErrorHandlers:

    def test_404_handler(self, client):
        resp = client.get('/api/nonexistent')
        assert resp.status_code == 404
        assert 'error' in resp.json

    def test_405_handler(self, client):
        resp = client.post('/api/health')
        assert resp.status_code == 405
        assert 'error' in resp.json
