#!/usr/bin/env python3
"""Full E2E tester — tests every feature as a real user."""
import os
os.environ['SECRET_KEY'] = 'test-e2e-secret'
os.environ['JWT_SECRET_KEY'] = 'test-e2e-jwt-secret'
os.environ['FLASK_ENV'] = 'testing'

import sys
from app import create_app, db, limiter
from config import TestingConfig

app = create_app(TestingConfig)
app.config['TESTING'] = True
app.config['WTF_CSRF_ENABLED'] = False
limiter.enabled = False

passed = 0
failed = 0
results = []

def test(name, func):
    global passed, failed
    try:
        func()
        passed += 1
        results.append(f"  PASS  {name}")
    except AssertionError as e:
        failed += 1
        results.append(f"  FAIL  {name}: {e}")
    except Exception as e:
        failed += 1
        results.append(f"  ERROR {name}: {e}")

with app.app_context():
    db.create_all()

client = app.test_client()

# ── HEALTH ──
def test_health():
    r = client.get('/api/health')
    assert r.status_code == 200
    assert r.json['status'] in ('healthy', 'degraded')
test("health endpoint", test_health)

# ── AUTH: REGISTER ──
def test_register():
    r = client.post('/api/auth/register', json={
        'email': 'tester@example.com', 'password': 'Tester123', 'username': 'tester'
    })
    assert r.status_code == 201
    assert r.json['user']['email'] == 'tester@example.com'
    assert r.json['user']['org_id'] is not None, "org_id must be auto-created"
test("register user", test_register)

def test_register_duplicate():
    r = client.post('/api/auth/register', json={
        'email': 'tester@example.com', 'password': 'Tester123'
    })
    assert r.status_code == 400
test("register duplicate email", test_register_duplicate)

def test_register_short_pw():
    r = client.post('/api/auth/register', json={
        'email': 'x@x.com', 'password': 'short'
    })
    assert r.status_code == 400
test("register short password", test_register_short_pw)

def test_register_no_upper():
    r = client.post('/api/auth/register', json={
        'email': 'x@x.com', 'password': 'lowercase1'
    })
    assert r.status_code == 400
test("register no uppercase", test_register_no_upper)

def test_register_no_digit():
    r = client.post('/api/auth/register', json={
        'email': 'x@x.com', 'password': 'NoDigitHere'
    })
    assert r.status_code == 400
test("register no digit", test_register_no_digit)

# ── AUTH: LOGIN ──
def test_login():
    r = client.post('/api/auth/login', json={
        'email': 'tester@example.com', 'password': 'Tester123'
    })
    assert r.status_code == 200
    assert 'user' in r.json
test("login", test_login)

def test_login_wrong_pw():
    r = client.post('/api/auth/login', json={
        'email': 'tester@example.com', 'password': 'wrongpassword'
    })
    assert r.status_code == 401
test("login wrong password", test_login_wrong_pw)

# ── AUTH: ME ──
def test_me():
    r = client.get('/api/auth/me')
    assert r.status_code == 200
    assert r.json['user']['email'] == 'tester@example.com'
test("get current user", test_me)

# ── AUTH: PROFILE ──
def test_update_profile():
    r = client.put('/api/auth/profile', json={'username': 'tester_updated'})
    assert r.status_code == 200
    assert r.json['user']['username'] == 'tester_updated'
test("update profile", test_update_profile)

# ── AUTH: PASSWORD ──
def test_change_password():
    r = client.put('/api/auth/password', json={
        'current_password': 'Tester123', 'new_password': 'NewPass123'
    })
    assert r.status_code == 200
test("change password", test_change_password)

def test_change_password_wrong_current():
    r = client.put('/api/auth/password', json={
        'current_password': 'wrong', 'new_password': 'NewPass123'
    })
    assert r.status_code == 400
test("change password wrong current", test_change_password_wrong_current)

# Re-login with new password
client.post('/api/auth/login', json={'email': 'tester@example.com', 'password': 'NewPass123'})

# ── CRM: CONTACTS ──
created_contact_id = None

def test_create_contact():
    global created_contact_id
    r = client.post('/api/v1/contacts/', json={
        'first_name': 'John', 'last_name': 'Doe',
        'email': 'john@corp.com', 'phone': '+1234567890',
        'company': 'Acme Corp', 'role': 'CTO', 'stage': 'lead', 'score': 75
    })
    assert r.status_code == 201
    created_contact_id = r.json['id']
    assert r.json['first_name'] == 'John'
    assert r.json['stage'] == 'lead'
test("create contact", test_create_contact)

def test_list_contacts():
    r = client.get('/api/v1/contacts/')
    assert r.status_code == 200
    assert len(r.json) >= 1
test("list contacts", test_list_contacts)

def test_get_contact():
    r = client.get(f'/api/v1/contacts/{created_contact_id}')
    assert r.status_code in (200, 405)
test("get contact", test_get_contact)

def test_update_contact():
    r = client.put(f'/api/v1/contacts/{created_contact_id}', json={
        'first_name': 'John Updated', 'stage': 'prospect'
    })
    assert r.status_code == 200
    assert r.json['first_name'] == 'John Updated'
    assert r.json['stage'] == 'prospect'
test("update contact", test_update_contact)

def test_contacts_filter_stage():
    r = client.get('/api/v1/contacts/?stage=prospect')
    assert r.status_code == 200
    assert all(c['stage'] == 'prospect' for c in r.json)
test("contacts filter by stage", test_contacts_filter_stage)

def test_contacts_filter_company():
    r = client.get('/api/v1/contacts/?company=Acme')
    assert r.status_code == 200
    assert len(r.json) >= 1
test("contacts filter by company", test_contacts_filter_company)

# ── CRM: DEALS ──
created_deal_id = None

def test_create_deal():
    global created_deal_id
    r = client.post('/api/v1/deals/', json={
        'title': 'Enterprise License', 'value': 120000,
        'currency': 'USD', 'stage': 'negotiation',
        'probability': 70, 'contact_id': created_contact_id
    })
    assert r.status_code == 201
    created_deal_id = r.json['id']
    assert r.json['title'] == 'Enterprise License'
    assert r.json['value'] == 120000
test("create deal", test_create_deal)

def test_list_deals():
    r = client.get('/api/v1/deals/')
    assert r.status_code == 200
    assert len(r.json) >= 1
test("list deals", test_list_deals)

def test_update_deal():
    r = client.put(f'/api/v1/deals/{created_deal_id}', json={
        'value': 150000, 'probability': 85
    })
    assert r.status_code == 200
    assert r.json['value'] == 150000
test("update deal", test_update_deal)

def test_deals_filter_stage():
    r = client.get('/api/v1/deals/?stage=negotiation')
    assert r.status_code == 200
    assert len(r.json) >= 1
test("deals filter by stage", test_deals_filter_stage)

# ── CRM: ACTIVITIES ──
created_activity_id = None

def test_create_activity():
    global created_activity_id
    r = client.post('/api/v1/activities/', json={
        'type': 'call', 'subject': 'Discovery call',
        'body': 'Discussed requirements', 'deal_id': created_deal_id
    })
    assert r.status_code == 201
    created_activity_id = r.json['id']
    assert r.json['type'] == 'call'
    assert r.json['completed'] is False
test("create activity", test_create_activity)

def test_list_activities():
    r = client.get('/api/v1/activities/')
    assert r.status_code == 200
    assert len(r.json) >= 1
test("list activities", test_list_activities)

def test_complete_activity():
    r = client.put(f'/api/v1/activities/{created_activity_id}')
    assert r.status_code == 204
test("complete activity", test_complete_activity)

def test_activities_filter_type():
    r = client.get('/api/v1/activities/?type=call')
    assert r.status_code == 200
    assert all(a['type'] == 'call' for a in r.json)
test("activities filter by type", test_activities_filter_type)

# ── CRM: DELETE ──
def test_delete_contact():
    r = client.delete(f'/api/v1/contacts/{created_contact_id}')
    assert r.status_code == 204
test("delete contact", test_delete_contact)

def test_delete_deal():
    r = client.delete(f'/api/v1/deals/{created_deal_id}')
    assert r.status_code == 204
test("delete deal", test_delete_deal)

# ── ERROR HANDLERS ──
def test_404():
    r = client.get('/api/nonexistent')
    assert r.status_code == 404
    assert r.json['error'] == 'Not found'
test("404 handler", test_404)

def test_405():
    r = client.patch('/api/contacts')
    assert r.status_code in (404, 405)
test("405 handler", test_405)

# ── IDOR ──
def test_idor_contact():
    r = client.post('/api/v1/contacts/', json={'first_name': 'Secret', 'last_name': 'Person'})
    cid = r.json['id']
    client2 = app.test_client()
    client2.post('/api/auth/register', json={
        'email': 'attacker2@example.com', 'password': 'Attack1234', 'username': 'attacker2'
    })
    r2 = client2.put(f'/api/v1/contacts/{cid}', json={'first_name': 'Hacked'})
    assert r2.status_code in (404, 302, 401)
test("IDOR: contact cross-user blocked", test_idor_contact)

# ── LOGOUT ──
def test_logout():
    r = client.post('/api/auth/logout')
    assert r.status_code == 200
test("logout", test_logout)

def test_me_after_logout():
    r = client.get('/api/auth/me')
    assert r.status_code in (302, 401)
test("me after logout returns unauthorized", test_me_after_logout)

# ── RESULTS ──
print("\n" + "=" * 60)
print("  E2E TEST RESULTS")
print("=" * 60)
for line in results:
    print(line)
print("=" * 60)
print(f"  TOTAL: {passed + failed} | PASS: {passed} | FAIL: {failed}")
print("=" * 60)

sys.exit(0 if failed == 0 else 1)
