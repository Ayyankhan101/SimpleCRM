def test_create_category(auth_client):
    response = auth_client.post('/api/categories', json={
        'name': 'Test Category',
        'color': '#FF0000'
    })
    assert response.status_code == 201
    assert response.json['name'] == 'Test Category'


def test_get_categories(auth_client):
    auth_client.post('/api/categories', json={'name': 'Cat1'})
    auth_client.post('/api/categories', json={'name': 'Cat2'})
    response = auth_client.get('/api/categories')
    assert response.status_code == 200
    assert len(response.json) == 2


def test_update_category(auth_client):
    create_res = auth_client.post('/api/categories', json={'name': 'Original'})
    cat_id = create_res.json['id']
    response = auth_client.put(f'/api/categories/{cat_id}', json={'name': 'Updated'})
    assert response.status_code == 200
    assert response.json['name'] == 'Updated'


def test_delete_category(auth_client):
    create_res = auth_client.post('/api/categories', json={'name': 'To Delete'})
    cat_id = create_res.json['id']
    response = auth_client.delete(f'/api/categories/{cat_id}')
    assert response.status_code == 200
