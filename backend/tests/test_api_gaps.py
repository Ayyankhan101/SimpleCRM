import io


class TestErrorHandlers:

    def test_404_returns_json(self, auth_client):
        resp = auth_client.get('/api/nonexistent')
        assert resp.status_code == 404
        assert resp.json['error'] == 'Not found'

    def test_405_returns_json(self, auth_client):
        resp = auth_client.patch('/api/data')
        assert resp.status_code == 405
        assert resp.json['error'] == 'Method not allowed'


class TestDataBulk:

    def test_bulk_delete(self, auth_client):
        ids = []
        for i in range(3):
            resp = auth_client.post('/api/data', json={
                'title': f'Bulk {i}', 'date': '2024-01-15'
            })
            ids.append(resp.json['id'])
        resp = auth_client.delete('/api/data/bulk', json={'ids': ids})
        assert resp.status_code == 200
        assert resp.json['deleted'] == 3

    def test_bulk_delete_empty_ids(self, auth_client):
        resp = auth_client.delete('/api/data/bulk', json={'ids': []})
        assert resp.status_code == 400

    def test_bulk_delete_no_body(self, auth_client):
        resp = auth_client.delete('/api/data/bulk')
        assert resp.status_code in (400, 415)


class TestDataIDOR:

    def test_cannot_read_other_user_entry(self, auth_client, client, db):
        create = auth_client.post('/api/data', json={
            'title': 'Mine', 'date': '2024-01-15'
        })
        eid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.get(f'/api/data/{eid}')
        assert resp.status_code == 404

    def test_cannot_update_other_user_entry(self, auth_client, client, db):
        create = auth_client.post('/api/data', json={
            'title': 'Mine', 'date': '2024-01-15'
        })
        eid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.put(f'/api/data/{eid}', json={'title': 'Hacked'})
        assert resp.status_code == 404

    def test_cannot_delete_other_user_entry(self, auth_client, client, db):
        create = auth_client.post('/api/data', json={
            'title': 'Mine', 'date': '2024-01-15'
        })
        eid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.delete(f'/api/data/{eid}')
        assert resp.status_code in (403, 404)


class TestDataEdgeCases:

    def test_get_nonexistent_entry(self, auth_client):
        resp = auth_client.get('/api/data/99999')
        assert resp.status_code == 404

    def test_update_nonexistent_entry(self, auth_client):
        resp = auth_client.put('/api/data/99999', json={'title': 'X'})
        assert resp.status_code == 404

    def test_delete_nonexistent_entry(self, auth_client):
        resp = auth_client.delete('/api/data/99999')
        assert resp.status_code == 404

    def test_create_entry_missing_title(self, auth_client):
        resp = auth_client.post('/api/data', json={'date': '2024-01-15'})
        assert resp.status_code == 400

    def test_create_entry_missing_date(self, auth_client):
        resp = auth_client.post('/api/data', json={'title': 'No date'})
        assert resp.status_code == 400

    def test_list_entries_empty(self, auth_client):
        resp = auth_client.get('/api/data')
        assert resp.status_code == 200
        assert resp.json['entries'] == []

    def test_pagination(self, auth_client):
        for i in range(15):
            auth_client.post('/api/data', json={
                'title': f'Entry {i}', 'date': '2024-01-15'
            })
        resp = auth_client.get('/api/data?per_page=5&page=1')
        assert resp.status_code == 200
        assert len(resp.json['entries']) == 5
        assert resp.json['total'] == 15

    def test_list_entries_filter_by_group(self, auth_client):
        auth_client.post('/api/data', json={
            'title': 'A', 'date': '2024-01-15', 'country': 'USA'
        })
        auth_client.post('/api/data', json={
            'title': 'B', 'date': '2024-01-15', 'country': 'UK'
        })
        resp = auth_client.get('/api/data?country=USA')
        assert resp.status_code == 200
        assert len(resp.json['entries']) == 1


class TestCategoriesIDOR:

    def test_cannot_read_other_user_category(self, auth_client, client, db):
        create = auth_client.post('/api/categories', json={'name': 'Mine'})
        cid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.get(f'/api/categories/{cid}')
        assert resp.status_code == 404

    def test_cannot_update_other_user_category(self, auth_client, client, db):
        create = auth_client.post('/api/categories', json={'name': 'Mine'})
        cid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.put(f'/api/categories/{cid}', json={'name': 'Hacked'})
        assert resp.status_code == 404

    def test_cannot_delete_other_user_category(self, auth_client, client, db):
        create = auth_client.post('/api/categories', json={'name': 'Mine'})
        cid = create.json['id']
        client.post('/api/auth/register', json={
            'email': 'other@example.com', 'password': 'Password1', 'username': 'other'
        })
        resp = client.delete(f'/api/categories/{cid}')
        assert resp.status_code == 404


class TestCategoriesEdgeCases:

    def test_create_category_missing_name(self, auth_client):
        resp = auth_client.post('/api/categories', json={})
        assert resp.status_code == 400

    def test_create_duplicate_category(self, auth_client):
        auth_client.post('/api/categories', json={'name': 'Dup'})
        resp = auth_client.post('/api/categories', json={'name': 'Dup'})
        assert resp.status_code == 400

    def test_get_nonexistent_category(self, auth_client):
        resp = auth_client.get('/api/categories/99999')
        assert resp.status_code == 404

    def test_update_nonexistent_category(self, auth_client):
        resp = auth_client.put('/api/categories/99999', json={'name': 'X'})
        assert resp.status_code == 404

    def test_delete_nonexistent_category(self, auth_client):
        resp = auth_client.delete('/api/categories/99999')
        assert resp.status_code == 404
