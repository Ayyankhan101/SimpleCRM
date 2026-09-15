import json
from datetime import date, datetime, timezone

from app.models import Activity, Contact, Deal, Organization, db


class TestContactsAPI:

    def _create_contact(self, client, **kwargs):
        data = {'first_name': 'John', 'last_name': 'Doe', 'email': 'john@test.com', **kwargs}
        return client.post('/api/v1/contacts/', json=data)

    def test_list_contacts_empty(self, auth_client):
        resp = auth_client.get('/api/v1/contacts/')
        assert resp.status_code == 200
        assert resp.json == []

    def test_create_contact(self, auth_client):
        resp = self._create_contact(auth_client)
        assert resp.status_code == 201
        assert resp.json['first_name'] == 'John'
        assert resp.json['last_name'] == 'Doe'
        assert resp.json['stage'] == 'lead'
        assert resp.json['score'] == 0

    def test_create_contact_minimal(self, auth_client):
        resp = auth_client.post('/api/v1/contacts/', json={'first_name': 'Jane'})
        assert resp.status_code == 201
        assert resp.json['first_name'] == 'Jane'

    def test_create_contact_missing_first_name(self, auth_client):
        resp = auth_client.post('/api/v1/contacts/', json={'last_name': 'Doe'})
        assert resp.status_code == 422

    def test_list_contacts_after_create(self, auth_client):
        self._create_contact(auth_client)
        self._create_contact(auth_client, first_name='Jane', email='jane@test.com')
        resp = auth_client.get('/api/v1/contacts/')
        assert resp.status_code == 200
        assert len(resp.json) == 2

    def test_list_contacts_filter_stage(self, auth_client):
        self._create_contact(auth_client, stage='lead')
        self._create_contact(auth_client, first_name='Jane', email='j@test.com', stage='prospect')
        resp = auth_client.get('/api/v1/contacts/?stage=lead')
        assert resp.status_code == 200
        assert len(resp.json) == 1
        assert resp.json[0]['stage'] == 'lead'

    def test_list_contacts_filter_company(self, auth_client):
        self._create_contact(auth_client, company='Acme Inc')
        self._create_contact(auth_client, first_name='Jane', email='j@test.com', company='Other Corp')
        resp = auth_client.get('/api/v1/contacts/?company=Acme')
        assert resp.status_code == 200
        assert len(resp.json) == 1

    def test_update_contact(self, auth_client):
        create = self._create_contact(auth_client)
        cid = create.json['id']
        resp = auth_client.put(f'/api/v1/contacts/{cid}', json={'first_name': 'Updated'})
        assert resp.status_code == 200
        assert resp.json['first_name'] == 'Updated'

    def test_update_contact_nonexistent(self, auth_client):
        resp = auth_client.put('/api/v1/contacts/9999', json={'first_name': 'X'})
        assert resp.status_code == 404

    def test_delete_contact(self, auth_client):
        create = self._create_contact(auth_client)
        cid = create.json['id']
        resp = auth_client.delete(f'/api/v1/contacts/{cid}')
        assert resp.status_code == 204

    def test_delete_contact_nonexistent(self, auth_client):
        resp = auth_client.delete('/api/v1/contacts/9999')
        assert resp.status_code == 404

    def test_deleted_contact_hidden_from_list(self, auth_client):
        create = self._create_contact(auth_client)
        cid = create.json['id']
        auth_client.delete(f'/api/v1/contacts/{cid}')
        resp = auth_client.get('/api/v1/contacts/')
        assert len(resp.json) == 0

    def test_idor_cannot_update_other_user_contact(self, auth_client, client, db):
        create = self._create_contact(auth_client)
        cid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.put(f'/api/v1/contacts/{cid}', json={'first_name': 'Hacked'})
        assert resp.status_code == 404


class TestDealsAPI:

    def _create_deal(self, client, **kwargs):
        data = {'title': 'Big Deal', 'value': 50000, **kwargs}
        return client.post('/api/v1/deals/', json=data)

    def test_list_deals_empty(self, auth_client):
        resp = auth_client.get('/api/v1/deals/')
        assert resp.status_code == 200
        assert resp.json == []

    def test_create_deal(self, auth_client):
        resp = self._create_deal(auth_client)
        assert resp.status_code == 201
        assert resp.json['title'] == 'Big Deal'
        assert resp.json['value'] == 50000
        assert resp.json['currency'] == 'USD'

    def test_create_deal_missing_title(self, auth_client):
        resp = auth_client.post('/api/v1/deals/', json={'value': 100})
        assert resp.status_code == 422

    def test_create_deal_with_stage(self, auth_client):
        resp = self._create_deal(auth_client, stage='negotiation', probability=50)
        assert resp.json['stage'] == 'negotiation'
        assert resp.json['probability'] == 50

    def test_list_deals_filter_stage(self, auth_client):
        self._create_deal(auth_client, stage='lead')
        self._create_deal(auth_client, title='Deal 2', stage='negotiation')
        resp = auth_client.get('/api/v1/deals/?stage=lead')
        assert len(resp.json) == 1

    def test_update_deal(self, auth_client):
        create = self._create_deal(auth_client)
        did = create.json['id']
        resp = auth_client.put(f'/api/v1/deals/{did}', json={'value': 100000})
        assert resp.status_code == 200
        assert resp.json['value'] == 100000

    def test_update_deal_nonexistent(self, auth_client):
        resp = auth_client.put('/api/v1/deals/9999', json={'value': 0})
        assert resp.status_code == 404

    def test_delete_deal(self, auth_client):
        create = self._create_deal(auth_client)
        did = create.json['id']
        resp = auth_client.delete(f'/api/v1/deals/{did}')
        assert resp.status_code == 204

    def test_delete_deal_nonexistent(self, auth_client):
        resp = auth_client.delete('/api/v1/deals/9999')
        assert resp.status_code == 404

    def test_deleted_deal_hidden(self, auth_client):
        create = self._create_deal(auth_client)
        did = create.json['id']
        auth_client.delete(f'/api/v1/deals/{did}')
        resp = auth_client.get('/api/v1/deals/')
        assert len(resp.json) == 0

    def test_idor_cannot_update_other_user_deal(self, auth_client, client, db):
        create = self._create_deal(auth_client)
        did = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other2@example.com', 'password': 'Password1', 'username': 'other2'
        })
        resp = client.put(f'/api/v1/deals/{did}', json={'value': 0})
        assert resp.status_code == 404


class TestActivitiesAPI:

    def _create_activity(self, client, **kwargs):
        data = {'type': 'call', 'subject': 'Follow up call', **kwargs}
        return client.post('/api/v1/activities/', json=data)

    def test_list_activities_empty(self, auth_client):
        resp = auth_client.get('/api/v1/activities/')
        assert resp.status_code == 200
        assert resp.json == []

    def test_create_activity(self, auth_client):
        resp = self._create_activity(auth_client)
        assert resp.status_code == 201
        assert resp.json['type'] == 'call'
        assert resp.json['subject'] == 'Follow up call'
        assert resp.json['completed'] is False

    def test_create_activity_missing_type(self, auth_client):
        resp = auth_client.post('/api/v1/activities/', json={'subject': 'Test'})
        assert resp.status_code == 422

    def test_create_activity_missing_subject(self, auth_client):
        resp = auth_client.post('/api/v1/activities/', json={'type': 'email'})
        assert resp.status_code == 422

    def test_create_activity_with_body(self, auth_client):
        resp = self._create_activity(auth_client, body='Discussed pricing')
        assert resp.json['body'] == 'Discussed pricing'

    def test_list_activities_filter_type(self, auth_client):
        self._create_activity(auth_client, type='call')
        self._create_activity(auth_client, type='email', subject='Email follow')
        resp = auth_client.get('/api/v1/activities/?type=call')
        assert len(resp.json) == 1
        assert resp.json[0]['type'] == 'call'

    def test_complete_activity(self, auth_client):
        create = self._create_activity(auth_client)
        aid = create.json['id']
        resp = auth_client.put(f'/api/v1/activities/{aid}')
        assert resp.status_code == 204

    def test_complete_activity_nonexistent(self, auth_client):
        resp = auth_client.put('/api/v1/activities/9999')
        assert resp.status_code == 404

    def test_completed_activity_shows_completed(self, auth_client):
        create = self._create_activity(auth_client)
        aid = create.json['id']
        auth_client.put(f'/api/v1/activities/{aid}')
        resp = auth_client.get(f'/api/v1/activities/')
        assert any(a['id'] == aid and a['completed'] for a in resp.json)


class TestCRMModels:

    def test_contact_to_dict(self, app, db):
        from app.models import User, Organization
        org = Organization(name='Test Org', slug='test-org')
        db.session.add(org)
        db.session.flush()
        user = User(email='m@test.com', username='modeltest', org_id=org.id)
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()
        contact = Contact(first_name='A', last_name='B', owner_id=user.id, org_id=org.id)
        db.session.add(contact)
        db.session.commit()
        d = contact.to_dict()
        assert d['full_name'] == 'A B'
        assert d['tags'] == []
        assert d['custom_fields'] == {}

    def test_contact_tags(self, app, db):
        from app.models import User, Organization
        org = Organization(name='Test Org 2', slug='test-org-2')
        db.session.add(org)
        db.session.flush()
        user = User(email='t@test.com', username='tagtest', org_id=org.id)
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()
        contact = Contact(first_name='X', last_name='Y', owner_id=user.id, org_id=org.id)
        contact.set_tags(['vip', 'enterprise'])
        db.session.add(contact)
        db.session.commit()
        assert contact.get_tags() == ['vip', 'enterprise']

    def test_contact_custom_fields(self, app, db):
        from app.models import User, Organization
        org = Organization(name='Test Org 3', slug='test-org-3')
        db.session.add(org)
        db.session.flush()
        user = User(email='cf@test.com', username='cftest', org_id=org.id)
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()
        contact = Contact(first_name='X', last_name='Y', owner_id=user.id, org_id=org.id)
        contact.set_custom_fields({'industry': 'tech', 'employees': 100})
        db.session.add(contact)
        db.session.commit()
        assert contact.get_custom_fields() == {'industry': 'tech', 'employees': 100}

    def test_deal_weighted_value(self, app, db):
        from app.models import User, Organization
        org = Organization(name='Test Org 4', slug='test-org-4')
        db.session.add(org)
        db.session.flush()
        user = User(email='w@test.com', username='wtest', org_id=org.id)
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()
        deal = Deal(title='Test', value=100000, probability=50, owner_id=user.id, org_id=org.id)
        assert deal.weighted_value == 50000

    def test_deal_weighted_value_zero_probability(self, app, db):
        from app.models import User, Organization
        org = Organization(name='Test Org 5', slug='test-org-5')
        db.session.add(org)
        db.session.flush()
        user = User(email='wz@test.com', username='wztest', org_id=org.id)
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()
        deal = Deal(title='Test', value=100000, probability=0, owner_id=user.id, org_id=org.id)
        assert deal.weighted_value == 0

    def test_deal_weighted_value_full_probability(self, app, db):
        from app.models import User, Organization
        org = Organization(name='Test Org 6', slug='test-org-6')
        db.session.add(org)
        db.session.flush()
        user = User(email='wf@test.com', username='wftest', org_id=org.id)
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()
        deal = Deal(title='Test', value=100000, probability=100, owner_id=user.id, org_id=org.id)
        assert deal.weighted_value == 100000

    def test_deal_notes(self, app, db):
        from app.models import User, Organization
        org = Organization(name='Test Org 7', slug='test-org-7')
        db.session.add(org)
        db.session.flush()
        user = User(email='dn@test.com', username='dntest', org_id=org.id)
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()
        deal = Deal(title='Test', owner_id=user.id, org_id=org.id)
        deal.set_notes({'key': 'value'})
        db.session.add(deal)
        db.session.commit()
        assert deal.get_notes() == {'key': 'value'}

    def test_activity_to_dict(self, app, db):
        from app.models import User, Organization
        org = Organization(name='Test Org 8', slug='test-org-8')
        db.session.add(org)
        db.session.flush()
        user = User(email='at@test.com', username='attest', org_id=org.id)
        user.set_password('Password1')
        db.session.add(user)
        db.session.flush()
        activity = Activity(type='email', subject='Test', owner_id=user.id, org_id=org.id)
        db.session.add(activity)
        db.session.commit()
        d = activity.to_dict()
        assert d['type'] == 'email'
        assert d['completed'] is False
        assert d['deal_title'] is None
        assert d['contact_name'] is None
