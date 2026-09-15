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


def test_delete_category_cascade(auth_client):
    cat_res = auth_client.post('/api/categories', json={'name': 'Cascade Cat'})
    cat_id = cat_res.json['id']
    
    auth_client.post('/api/data', json={
        'title': 'Entry with Category',
        'date': '2024-01-15',
        'category_id': cat_id
    })
    
    auth_client.delete(f'/api/categories/{cat_id}')
    
    response = auth_client.get('/api/data')
    assert response.status_code == 200
    assert response.json['entries'][0]['category_id'] is None
