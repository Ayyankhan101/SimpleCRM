import os
import secrets

import requests
from app import limiter
from app.models import Organization, User, db
from flask import Blueprint, current_app, jsonify, request, session
from flask_login import current_user, login_required, login_user, logout_user

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/register', methods=['POST'])
@limiter.limit("5/minute")
def register():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400

    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if not any(c.isupper() for c in data['password']):
        return jsonify({'error': 'Password must contain at least one uppercase letter'}), 400

    if not any(c.islower() for c in data['password']):
        return jsonify({'error': 'Password must contain at least one lowercase letter'}), 400

    if not any(c.isdigit() for c in data['password']):
        return jsonify({'error': 'Password must contain at least one digit'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    if data.get('username') and User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400

    user = User(
        email=data['email'],
        username=data.get('username') or data['email'].split('@')[0]
    )
    user.set_password(data['password'])

    slug = user.username.lower().replace(' ', '-')
    org = Organization(name=f"{user.username}'s Workspace", slug=slug)
    db.session.add(org)
    db.session.flush()
    user.org_id = org.id

    db.session.add(user)
    db.session.commit()

    login_user(user)

    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201


@bp.route('/login', methods=['POST'])
@limiter.limit("10/minute")
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    login_user(user)

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    })


@bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'})


@bp.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({'user': current_user.to_dict()})


@bp.route('/google', methods=['GET'])
@limiter.limit("5/minute")
def google_oauth():
    google_client_id = current_app.config['GOOGLE_CLIENT_ID']
    google_redirect_uri = current_app.config['GOOGLE_REDIRECT_URI']

    if not google_client_id:
        return jsonify({'error': 'Google OAuth not configured'}), 500

    state = secrets.token_urlsafe(16)
    session['oauth_state'] = state

    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={google_client_id}&redirect_uri={google_redirect_uri}&response_type=code&scope=openid email profile&state={state}"

    return jsonify({'auth_url': auth_url, 'state': state})


@bp.route('/google/callback', methods=['GET'])
@limiter.limit("10/minute")
def google_callback():
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        return jsonify({'error': error}), 400

    if request.args.get('state') != session.get('oauth_state'):
        return jsonify({'error': 'Invalid state parameter'}), 400

    if not code:
        return jsonify({'error': 'No code provided'}), 400

    google_client_id = current_app.config['GOOGLE_CLIENT_ID']
    google_client_secret = current_app.config['GOOGLE_CLIENT_SECRET']
    google_redirect_uri = current_app.config['GOOGLE_REDIRECT_URI']

    token_url = 'https://oauth2.googleapis.com/token'
    token_data = {
        'client_id': google_client_id,
        'client_secret': google_client_secret,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': google_redirect_uri
    }

    token_response = requests.post(token_url, data=token_data, timeout=10)

    if token_response.status_code != 200:
        return jsonify({'error': 'Failed to exchange code for token'}), 400

    tokens = token_response.json()
    access_token = tokens.get('access_token')

    userinfo_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
    userinfo_response = requests.get(userinfo_url, headers={'Authorization': f'Bearer {access_token}'}, timeout=10)

    if userinfo_response.status_code != 200:
        return jsonify({'error': 'Failed to get user info'}), 400

    userinfo = userinfo_response.json()

    user = User.query.filter_by(google_id=userinfo['id']).first()

    if not user:
        user = User.query.filter_by(email=userinfo['email']).first()

        if user:
            user.google_id = userinfo['id']
        else:
            user = User(
                email=userinfo['email'],
                username=userinfo.get('name', userinfo['email'].split('@')[0]),
                google_id=userinfo['id']
            )
            db.session.add(user)

    db.session.commit()
    login_user(user)

    frontend_url = os.environ.get('FRONTEND_URL') or 'http://localhost:5173'
    return f"<script>window.location.href='{frontend_url}/auth/callback';</script>"


@bp.route('/google/mobile', methods=['POST'])
@limiter.limit("5/minute")
def google_mobile():
    data = request.get_json()
    id_token = data.get('id_token')

    if not id_token:
        return jsonify({'error': 'No id_token provided'}), 400

    google_client_id = current_app.config['GOOGLE_CLIENT_ID']

    verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    verify_response = requests.get(verify_url, timeout=10)

    if verify_response.status_code != 200:
        return jsonify({'error': 'Invalid token'}), 400

    userinfo = verify_response.json()

    if userinfo.get('aud') != google_client_id:
        return jsonify({'error': 'Invalid audience'}), 400

    user = User.query.filter_by(google_id=userinfo['sub']).first()

    if not user:
        user = User.query.filter_by(email=userinfo['email']).first()

        if user:
            user.google_id = userinfo['sub']
        else:
            user = User(
                email=userinfo['email'],
                username=userinfo.get('name', userinfo['email'].split('@')[0]),
                google_id=userinfo['sub']
            )
            db.session.add(user)

    db.session.commit()
    login_user(user)

    return jsonify({
        'message': 'Google login successful',
        'user': user.to_dict()
    })


@bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()

    if data.get('username'):
        existing = User.query.filter_by(username=data['username']).first()
        if existing and existing.id != current_user.id:
            return jsonify({'error': 'Username already taken'}), 400
        current_user.username = data['username']

    if data.get('email'):
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != current_user.id:
            return jsonify({'error': 'Email already registered'}), 400
        current_user.email = data['email']

    db.session.commit()
    return jsonify({'user': current_user.to_dict()})


@bp.route('/password', methods=['PUT'])
@login_required
def change_password():
    data = request.get_json()

    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password required'}), 400

    if not current_user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 400

    if len(data['new_password']) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400

    if not any(c.isupper() for c in data['new_password']):
        return jsonify({'error': 'New password must contain at least one uppercase letter'}), 400

    if not any(c.islower() for c in data['new_password']):
        return jsonify({'error': 'New password must contain at least one lowercase letter'}), 400

    if not any(c.isdigit() for c in data['new_password']):
        return jsonify({'error': 'New password must contain at least one digit'}), 400

    current_user.set_password(data['new_password'])
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'})
