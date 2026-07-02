def test_register(client, db):
    response = client.post('/api/auth/register', json={
        'email': 'new@example.com',
        'password': 'password123',
        'username': 'newuser'
    })
    assert response.status_code == 201
    assert 'user' in response.json


def test_register_short_password(client, db):
    response = client.post('/api/auth/register', json={
        'email': 'new@example.com',
        'password': 'short',
        'username': 'newuser'
    })
    assert response.status_code == 400
    assert 'at least 8 characters' in response.json['error']


def test_register_duplicate_email(client, db):
    client.post('/api/auth/register', json={
        'email': 'dup@example.com',
        'password': 'password123'
    })
    response = client.post('/api/auth/register', json={
        'email': 'dup@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400
    assert 'already registered' in response.json['error']


def test_login(client, db):
    client.post('/api/auth/register', json={
        'email': 'login@example.com',
        'password': 'password123'
    })
    response = client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'user' in response.json


def test_login_wrong_password(client, db):
    client.post('/api/auth/register', json={
        'email': 'login@example.com',
        'password': 'password123'
    })
    response = client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401


def test_me(auth_client):
    response = auth_client.get('/api/auth/me')
    assert response.status_code == 200
    assert response.json['user']['email'] == 'test@example.com'


def test_logout(auth_client):
    response = auth_client.post('/api/auth/logout')
    assert response.status_code == 200


def test_update_profile(auth_client):
    response = auth_client.put('/api/auth/profile', json={
        'username': 'newname'
    })
    assert response.status_code == 200
    assert response.json['user']['username'] == 'newname'


def test_change_password(auth_client):
    response = auth_client.put('/api/auth/password', json={
        'current_password': 'password123',
        'new_password': 'newpassword123'
    })
    assert response.status_code == 200
    assert 'updated' in response.json['message'].lower()


def test_change_password_wrong_current(auth_client):
    response = auth_client.put('/api/auth/password', json={
        'current_password': 'wrongpassword',
        'new_password': 'newpassword123'
    })
    assert response.status_code == 400
    assert 'incorrect' in response.json['error'].lower()


def test_change_password_short_new(auth_client):
    response = auth_client.put('/api/auth/password', json={
        'current_password': 'password123',
        'new_password': 'short'
    })
    assert response.status_code == 400
    assert 'at least 8' in response.json['error']
